
Meteor.publish("users", function (){
    /*var user = this.user();
    console.log(user);*/
    var user = Meteor.users.findOne(this.userId);
    var hiddenUsers = ['90.matheus@gmail.com'];
    var hideIt = user ? (['90.matheus@gmail.com', 'jamesgillmore@gmail.com'].indexOf(user.profile.email) < 0) : false;

    if(Roles.userIsInRole(this.userId, ['admin'])) return Meteor.users.find({"profile.email": {$nin: (hideIt ? hiddenUsers : [])}}); // everything
    else return Meteor.users.find({_id: this.userId});
});

//
Meteor.startup(function(){
    if( Meteor.users.find().count() === 0 ){
        var defaultUsers = [
            {
                _id: 'systememail',
                emails: [{address: '709748832761-bmeg5fvet775tvluqbasa0rrgdhfb4m6@developer.gserviceaccount.com', verified: true}],
                profile: {
                    email: '709748832761-bmeg5fvet775tvluqbasa0rrgdhfb4m6@developer.gserviceaccount.com',
                    family_name: "Documents",
                    gender: "male",
                    given_name: "Sequencia",
                    locale: "us",
                    name: "Sequencia Documents",
                    verified_email: true
                },
                roles: ['admin']
            },
            {
                _id: 'systemowneremail',
                emails: [{address: 'sequenciadocuments@gmail.com', verified: true}],
                profile: {
                    email: 'sequenciadocuments@gmail.com',
                    family_name: "Documents",
                    gender: "male",
                    given_name: "Sequencia",
                    locale: "us",
                    name: "Sequencia Documents",
                    verified_email: true
                },
                roles: ['admin']
            }
        ];
        for(var i = 0; i < defaultUsers.length; i++){
            var id = Meteor.users.insert(defaultUsers[i]);
            if( defaultUsers[i].roles[0] == 'admin' )
                Roles.addUsersToRoles(id, ['admin'])
        }
    }
});



Meteor.users.allow({
    insert: function(userId, doc) {
        return Roles.userIsInRole(userId, ['admin']);
    },
    update: function(userId, doc, fields, modifier) {
        return true; //Roles.userIsInRole(userId, ['admin']);
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
        "90.matheus@gmail.com",
        "whitcook@gmail.com"
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
        return false;
    }

    if( adminEmails.indexOf(user.services.google.email) > -1 ){
        Roles.addUsersToRoles(new_user._id, ['admin']);
        new_user.roles = ['admin'];
        new_user.verified_user = true;
    }else{
        var email = Emails.findOne({email: user.services.google.email});
        if( email && email.roles && ['customer', 'admin'].indexOf(email.roles[0]) > -1 ){
            Roles.addUsersToRoles(new_user._id, [email.roles[0]]);
            new_user.roles = [email.roles[0]];
        }else{
            Roles.addUsersToRoles(new_user._id, ['customer']);
            new_user.roles = ['customer'];
        }
        if( email )
            new_user.verified_user = true;
        else
            new_user.verified_user = false;
    }

    /*else{
        Roles.addUsersToRoles(new_user._id, ['customer']);
        new_user.roles = ['customer'];
    }*/

    new_user.profile = result.data;
    new_user.services.google = user.services.google;

    Meteor.call('reassignPermissions', new_user);

    return new_user;
});
