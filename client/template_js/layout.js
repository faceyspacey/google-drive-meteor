


/** layout HELPERS, EVENTS & CALLBACKS **/

Template.layout.helpers({
    title: function(){
        return Session.get('page_title');
    }
});

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


/** page_home HELPERS, EVENTS & CALLBACKS **/

Template.page_home.helpers({
    nullObj: {user_id: 0, file_id: 0}
});


/** page_title HELPERS, EVENTS & CALLBACKS **/

Template.page_title.helpers({
    title: function(){
        return Session.get('page_title');
    }
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

        Drive.call('refreshFiles', {cb: function(){
            _.each(Files.find().fetch(), function(file){
                Drive.call('refreshPermissions', {fileId: file._id});
            });
        }});
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