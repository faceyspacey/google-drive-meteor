
Router.configure({
    layoutTemplate: 'layout',
    yieldTemplates: {
        'footer': { to: 'footer' }
    },
    waitOn: function () {
        return Meteor.subscribe('users');
    }
});

Router.map(function () {
    this.route('home', {
        path: '/',
        template: 'page_home',
        waitOn: function(){
            return Session.set('page_title', 'Sequencia Documents Publisher');
        },
        data: {}
    });
    this.route('home', {
        path: '/home',
        template: 'page_home',
        waitOn: function(){
            return Session.set('page_title', 'Sequencia Documents Publisher');
        },
        data: {}
    });
    this.route('editUser', {
        path: '/editUser/:user_id/:type',
        template: 'page_edit_user',
        waitOn: function(){
            return Session.set('page_title', 'Edit user permissions');
        },
        data: function(){ return {user_id: this.params.user_id, model_type: this.params.type}; }
    });
    this.route('editFile', {
        path: '/editFile/:file_id',
        template: 'page_edit_file',
        waitOn: function(){
            return Session.set('page_title', 'Edit file permissions');
        },
        data: function(){ return {file_id: this.params.file_id}; }
    });
    this.route('files', {
        path: '/files',
        template: 'page_files',
        waitOn: function(){
            return Session.set('page_title', 'Files');
        },
        data: function(){ return {}; }
    });
    this.route('users', {
        path: '/users',
        template: 'page_users',
        waitOn: function(){
            return Session.set('page_title', 'All Users');
        },
        data: function(){ return {parameters: {type: 'both'}}; }
    });
    this.route('onlyUsers', {
        path: '/users/registered',
        template: 'page_users',
        waitOn: function(){
            return Session.set('page_title', 'Registered Users');
        },
        data: function(){ return {parameters: {type: 'user'}}; }
    });
    this.route('onlyEmails', {
        path: '/users/pre_registered',
        template: 'page_users',
        waitOn: function(){
            return Session.set('page_title', 'Pre-registered Users');
        },
        data: function(){ return {parameters: {type: 'email'}}; }
    });
});

Handlebars.registerHelper('isCurrent', function(pathName){
    return Router.current().route.name == pathName ? 'current' : '';
});