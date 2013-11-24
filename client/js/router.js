
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
        path: '/editUser/:user_id/:model_type',
        template: 'page_edit_user',
        waitOn: function(){
            return Session.set('page_title', 'Edit user permissions');
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
        data: function(){ return {parameters: {type: 'both', role: 'both'}}; }
    });
    this.route('onlyAdmins', {
        path: '/users/admins',
        template: 'page_users',
        waitOn: function(){
            return Session.set('page_title', 'Admins');
        },
        data: function(){ return {parameters: {type: 'both', role: 'admin'}}; }
    });
    this.route('onlyCustomers', {
        path: '/users/customers',
        template: 'page_users',
        waitOn: function(){
            return Session.set('page_title', 'Customers');
        },
        data: function(){ return {parameters: {type: 'both', role: 'customer'}}; }
    });
});