
/** users_list HELPERS, EVENTS & CALLBACKS **/

Template.users_list.helpers({
    listParams: function(){
        return {file_id: this.file_id, type: this.type, role: this.role};
    },
    usersCount: function(params){
        var data = [],
            permissions = Permissions.find();
        switch(params.type){
            case 'user':    data = Meteor.users.find().fetch(); break;
            case 'email':   data = Emails.find().fetch(); break;
            default:        if( params.role == 'admin' )
                                data = Meteor.users.find({roles: ['admin']}).fetch().concat(Emails.find({roles: ['admin']}).fetch());
                            else if( params.role == 'customer' )
                                data = Meteor.users.find({roles: ['customer']}).fetch().concat(Emails.find({roles: ['customer']}).fetch());
                            else
                                data = Meteor.users.find().fetch().concat(Emails.find().fetch());
                            break;
        }
        return data.length;
    },
    users: function(params) {
        var sortBy = Session.get('home_user_sort_by'),
            sortDir = Session.get('home_user_sort_dir'),
            data = [],
            permissions = Permissions.find();

        if( sortBy == undefined ){
            Session.set('home_user_sort_dir', 1);
            Session.set('home_user_sort_by', 'getFirstName');
        }

        switch(params.type){
            case 'user':    data = Meteor.users.find().fetch(); break;
            case 'email':   data = Emails.find().fetch(); break;
            default:        if( params.role == 'admin' )
                                data = Meteor.users.find({roles: ['admin']}).fetch().concat(Emails.find({roles: ['admin']}).fetch());
                            else if( params.role == 'customer' )
                                data = Meteor.users.find({roles: ['customer']}).fetch().concat(Emails.find({roles: ['customer']}).fetch());
                            else
                                data = Meteor.users.find().fetch().concat(Emails.find().fetch());
                            break;
        }

        var new_data = _.sortBy(data, function(row){
            if( _.isFunction(row[sortBy]) ){
                return row[sortBy]();
            }else{
                return row[sortBy];
            }
        });

        return sortDir == 1 ? new_data : new_data.reverse();
    },
    sorted : function(field){
        var sortBy = Session.get('home_user_sort_by'),
            sortDir = Session.get('home_user_sort_dir');
        if( sortBy == field )
            return sortDir > -1 ? 'sorted-asc' : 'sorted-desc';
        else
            return '';
    }
});

Template.users_list.events({
    "click .sortable": function(e) {
        var sortBy = Session.get('home_user_sort_by'),
            sortDir = Session.get('home_user_sort_dir'),
            table = $(e.target).parents().filter('table.table');

        sortBy = $(e.target).data('field');
        if( sortDir == undefined )
            sortDir = 1;
        else
            sortDir = -1*sortDir;

        $(table).find('.sortable').removeClass('sorted-asc').removeClass('sorted-desc');
        $(e.target).addClass('sorted-'+(sortDir > -1 ? 'asc' : 'desc'));

        console.log(sortBy);
        Session.set('home_user_sort_dir', sortDir);
        Session.set('home_user_sort_by', sortBy);
    },
    "click .edit-user-btn": function(e){
        Router.go("editUser", {user_id: this._id, model_type: this.model_type});
    },
    "click .can-view-btn": function(e){
        var file_id = Router.current().params['file_id'],
            user = this;

        user.assignPermission(file_id, 'view');
    },
    "click .can-edit-btn": function(e){
        var file_id = Router.current().params['file_id'],
            user = this;

        user.assignPermission(file_id, 'edit');
    },
    "click .can-nothing-btn": function(e){
        var file_id = Router.current().params['file_id'],
            user = this;

        user.assignPermission(file_id, 'nothing');
    },
});