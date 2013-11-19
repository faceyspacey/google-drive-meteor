
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


Meteor.startup(function(){
    Deps.autorun(function(){
        var permissions = Permissions.find().count();
        console.log('Permissions changed');
        if( Subscriptions.files ){
            Subscriptions.files.stop();
            Meteor.setTimeout(function(){
                Subscriptions.files = Meteor.subscribe('files');
                console.log('Files refreshed');
            }, 50);
        }
    });

    Deps.autorun(function() {
        var user = Meteor.user();
        refreshSubscriptions();
        if (Meteor.user()) {
            Meteor.setTimeout(function(){
                if( Roles.userIsInRole(Meteor.userId(), ['admin']) ){
                    Drive.call('refreshFiles', {cb: function(){
                        _.each(Files.find().fetch(), function(file){
                            Drive.call('refreshPermissions', {fileId: file._id});
                        });
                    }});
                }
            }, 50);
        }else{
            Router.go('home');
        }
    });
});