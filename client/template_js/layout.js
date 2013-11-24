


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
    adminsCount: function(){ return Meteor.users.find({roles: ['admin']}).fetch().concat(Emails.find({roles: ['admin']}).fetch()).length; },
    customersCount: function(){ data = Meteor.users.find({roles: ['customer']}).fetch().concat(Emails.find({roles: ['customer']}).fetch()).length; }
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
    adminsCount: function(){ return Meteor.users.find({roles: ['admin']}).fetch().concat(Emails.find({roles: ['admin']}).fetch()).length; },
    customersCount: function(){ return Meteor.users.find({roles: ['customer']}).fetch().concat(Emails.find({roles: ['customer']}).fetch()).length; }
});

Template.sidebar.events({
    'click #refresh-list-btn': function(){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return;

        Drive.refreshFiles();
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

/** NAVIGATION HELPERS */

Handlebars.registerHelper('isCurrent', function(pathName){
    return Router.current().route.name == pathName ? 'current' : '';
});

Handlebars.registerHelper('isCurrentSidebar', function(pathName){
    if( pathName == 'usersSidebar' )
        return ['onlyAdmins', 'onlyCustomers', 'users'].indexOf(Router.current().route.name) >-1 ? 'current' : '';

    return '';
});