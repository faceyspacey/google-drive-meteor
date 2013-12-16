
Router.configure({
    layoutTemplate: 'layout',
    yieldTemplates: {
        'footer': { to: 'footer' }
    },
    waitOn: function () {
        return Meteor.subscribe('users');
    },
    before: function(){

        if( !Meteor.user() ){
            this.render('please_login');
            this.stop();
        }

        if( '/home/welcome' == Router.current().route.originalPath ){
            Meteor.logout(function(){
                Router.go('home');
            });
        }else if( Meteor.user() && ['forbidden', 'nodocuments'].indexOf(Router.current().route.name) < 0 ){
            if( Meteor.user().verified_user == false && Router.current().route.name != 'forbidden'){
                Router.go('forbidden');
                return this.stop();
            }else if( !Meteor.user().isAdmin() && Router.current().route.name != 'nodocuments' && Files.find().count() == 0 ){
                Router.go('nodocuments');
                return this.stop();
            }
        }
    }
});

Router.map(function () {
    this.route('home', {
        path: '/',
        template: 'page_home',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Home');
        },
        data: {}
    });
    this.route('home', {
        path: '/home',
        template: 'page_home',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Home');
        },
        data: {}
    });
    this.route('welcome', {
        path: '/home/welcome',
        template: 'page_home',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Home');
        },
        data: {}
    });
    this.route('help', {
        path: '/help',
        template: 'page_help',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Help');
        },
        data: {}
    });
    this.route('forbidden', {
        path: '/forbidden',
        template: 'page_system_message',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'You do not have access to private Sequencia Technologies documents. We have sent a request for access on your behalf.');
        },
        data: {}
    });
    this.route('nodocuments', {
        path: '/nodocuments',
        template: 'page_system_message',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'You have not been granted access to any private Sequencia Technologies documents. Please email us to request access.');
        },
        data: {}
    });
    this.route('myAccount', {
        path: '/myAccount',
        template: 'page_edit_user',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'My Account');
        },
        data: function(){
            return {
                user_id: Roles.userIsInRole(Meteor.userId(), ['admin']) ? Meteor.userId() : false,
                model_type: 'user'
            };
        }
    });
    this.route('editUser', {
        path: '/editUser/:user_id/:model_type',
        template: 'page_edit_user',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Edit user permissions');
        },
        data: function(){
            if( ['user', 'email'].indexOf(this.params.model_type) > -1 )
                var model_type = this.params.model_type;
            else{
                var user = Meteor.users.findOne(this.params.user_id);
                var model_type = user ? 'user' : 'email';
            }
            return {
                user_id: this.params.user_id,
                model_type: model_type
            };
        }
    });
    this.route('editFile', {
        path: '/editFile/:file_id',
        template: 'page_edit_file',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Edit file permissions');
        },
        data: function(){ return {file_id: this.params.file_id}; }
    });
    this.route('files', {
        path: '/files',
        template: 'page_files',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Files');
        },
        data: function(){ return {}; }
    });
    this.route('users', {
        path: '/users',
        template: 'page_users',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'All Users');
        },
        data: function(){ return {parameters: {type: 'both', role: 'both'}}; }
    });
    this.route('onlyAdmins', {
        path: '/users/admins',
        template: 'page_users',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Admins');
        },
        data: function(){ return {parameters: {type: 'both', role: 'admin'}}; }
    });
    this.route('onlyCustomers', {
        path: '/users/customers',
        template: 'page_users',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Customers');
        },
        data: function(){ return {parameters: {type: 'both', role: 'customer'}}; }
    });
    this.route('onlyUnverified', {
        path: '/users/unverified',
        template: 'page_users',
        waitOn: function(){
            return Meteor.subscribe('users') && Session.set('page_title', 'Unverified users');
        },
        data: function(){ return {parameters: {type: 'user', role: 'both', unverified: true}}; }
    });
});

Handlebars.registerHelper('isRouteName', function(name){
    if( !Router.current() ) return false;

    return Router.current().route.name === name;
});