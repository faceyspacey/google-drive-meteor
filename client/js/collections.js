
Emails = new Meteor.Collection('emails', {
    reactive: true,
    transform: function(doc){ return new EmailModel(doc); }
});

Files = new Meteor.Collection('files', {
    reactive: true,
    transform: function(doc){ return new FileModel(doc); }
});

Permissions = new Meteor.Collection('permissions', {
    reactive: true,
    transform: function(doc){ return new PermissionModel(doc); }
});

Meteor.users._transform = function(doc) {
    return new UserModel(doc);
};
Meteor.users.reactive = true;

refreshSubscriptions = function(){
    Subscriptions.emails = Meteor.subscribe('emails');
    Subscriptions.files = Meteor.subscribe('files');
    Subscriptions.permissions = Meteor.subscribe('permissions');
    Subscriptions.users = Meteor.subscribe('users');
};

Subscriptions = {
    emails: Meteor.subscribe('emails'),
    files: Meteor.subscribe('files'),
    permissions: Meteor.subscribe('permissions'),
    users: Meteor.subscribe('users')
}


//Meteor.logout();

Meteor.startup(function(){
    //Meteor.logout();
    /*
    Meteor.logout(function(){
        console.log('logging out previous user');
        Meteor.loginWithGoogle({
            requestPermissions: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile']
        },function(error){
            if( error )
                console.log(error);
            else
                console.log('logging in current user');
        });
    });*/

    Deps.autorun(function(){
        var permissions = Permissions.find().count();
        //console.log('Permissions changed');
        if( Subscriptions.files ){
            Subscriptions.files.stop();
            Meteor.setTimeout(function(){
                Subscriptions.files = Meteor.subscribe('files');
               // console.log('Files refreshed');
            }, 50);
        }
    });

    Deps.autorun(function() {
        var user = Meteor.user();
        refreshSubscriptions();
        if (Meteor.user()) {
            Meteor.setTimeout(function(){
                if( Roles.userIsInRole(Meteor.userId(), ['admin']) ){
                    Drive.refreshFiles();
                }
            }, 1000);
        }
    });
});