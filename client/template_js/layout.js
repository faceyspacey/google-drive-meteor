


/** layout HELPERS, EVENTS & CALLBACKS **/

Template.layout.events({
    'click .toggle-sidebar': function(){
        $('#container').toggleClass('sidebar-closed');
    }
});


/** navbar_left HELPERS, EVENTS & CALLBACKS **/

Template.navbar_left.helpers({
    filesCount: function(){ return Files.find({}).count(); },
    allUsersCount: function(){ return Meteor.users.find().count()+Emails.find().count()},
    usersCount: function(){ return Meteor.users.find().count(); },
    emailsCount: function(){ return Emails.find().count(); }
});


/** sidebar HELPERS, EVENTS & CALLBACKS **/

Template.sidebar.helpers({
    filesCount: function(){ return Files.find({}).count(); },
    allUsersCount: function(){ return Meteor.users.find().count()+Emails.find().count()},
    usersCount: function(){ return Meteor.users.find().count(); },
    emailsCount: function(){ return Emails.find().count(); }
});

Template.sidebar.events({
    'click #refresh-list-btn': function(){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return;

        Drive.call('refreshFiles', {});
    },
    'click #refresh-permissions-btn': function(){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return;

        _.each(Files.find().fetch(), function(file){
            Drive.call('refreshPermissions', {fileId: file._id});
        });
    }
});

Template.sidebar.rendered = function(){
    initializeSidebar();
};