
Meteor.publish("users", function (){
    if(Roles.userIsInRole(this.userId, ['admin'])) return Meteor.users.find(); // everything
    else return Meteor.users.find({_id: this.userId});
});

//
Meteor.startup(function(){
    if( Meteor.users.find().count() === 0 ){
        var defaultUsers = [
            {
                _id: 'systememail',
                emails: [{address: '709748832761-bmeg5fvet775tvluqbasa0rrgdhfb4m6@developer.gserviceaccount.com', verified: true}],
                profiles: {
                    email: '709748832761-bmeg5fvet775tvluqbasa0rrgdhfb4m6@developer.gserviceaccount.com',
                    family_name: "Documents",
                    gender: "male",
                    given_name: "Sequencia",
                    locale: "us",
                    name: "Sequencia Documents",
                    verified_email: true
                }
            }
        ];
        for(var i = 0; i < defaultUsers.length; i++){
            Meteor.users.insert(defaultUsers[i]);
        }
    }
});



Meteor.users.allow({
    insert: function(userId, doc) {
        return Roles.userIsInRole(userId, ['admin']);
    },
    update: function(userId, doc, fields, modifier) {
        return Roles.userIsInRole(userId, ['admin']);
    },
    remove: function(userId, doc) {
        return Roles.userIsInRole(userId, ['admin']);
    }
});


Fiber = Npm.require("fibers");

Meteor.methods({
    refreshUserPermID: function(params){

        Fiber(function(params) {
            Meteor.users.update(params.user_id, {$set: {perm_id: params.perm_id}});
        }).run(params);

        return true;
    }
});


Accounts.onCreateUser(function(options, user){
    var adminEmails = [
        "sequenciadocuments@gmail.com",
        "jamesgillmore@gmail.com",
        "james@faceyspacey.com",
        "90.matheus@gmail.com"
    ];
    var accessToken = user.services.google.accessToken,
        result,
        new_user = user;

    result = Meteor.http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        params: {
            access_token: accessToken
        }
    });

    if( result.error ){
        console.log(error);
        return user;
    }

    if( adminEmails.indexOf(user.services.google.email) > -1 ){
        Roles.addUsersToRoles(new_user._id, ['admin']);
        new_user.roles = ['admin'];
    }else{
        var email = Emails.findOne({email: user.services.google.email});
        if( email && email.profile.role == 'admin' )
            Roles.addUsersToRoles(new_user._id, ['admin']);
            new_user.roles = ['admin'];
    }

    /*else{
        Roles.addUsersToRoles(new_user._id, ['customer']);
        new_user.roles = ['customer'];
    }*/

    new_user.profile = result.data;

    Meteor.call('reassignPermissions', new_user);

    return new_user;
});
