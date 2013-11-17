
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

refreshSubscriptions = function(){
    Meteor.subscribe('emails');
    Meteor.subscribe('files');
    Meteor.subscribe('permissions');
    Meteor.subscribe('users');
}

Meteor.startup(function(){
    refreshSubscriptions();

    Meteor.autorun(function() {
        if (Meteor.user()) {
            refreshSubscriptions();
            Meteor.setTimeout(function(){
                if( Roles.userIsInRole(Meteor.userId(), ['admin']) ){
                    Drive.call();
                }
            }, 50);
        }else{
            refreshSubscriptions();
            Router.go('home');
        }
    });
})
