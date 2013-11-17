
/** users_list HELPERS, EVENTS & CALLBACKS **/

Template.users_list.helpers({
    listParams: function(){
        return {file_id: this.file_id, type: this.type};
    },
    usersCount: function(params){
        var data = [];
        switch(params.type){
            case 'user':    data = Meteor.users.find().fetch(); break;
            case 'email':   data = Emails.find().fetch(); break;
            default:        data = Meteor.users.find().fetch().concat(Emails.find().fetch()); break;
        }
        return data.length;
    },
    users: function(params) {
        var sortBy = Session.get('home_user_sort_by'),
            sortDir = Session.get('home_user_sort_dir'),
            data = [];

        if( sortBy == undefined ){
            Session.set('home_user_sort_dir', 1);
            Session.set('home_user_sort_by', 'getFirstName');
        }

        switch(params.type){
            case 'user':    data = Meteor.users.find().fetch(); break;
            case 'email':   data = Emails.find().fetch(); break;
            default:        data = Meteor.users.find().fetch().concat(Emails.find().fetch()); break;
        }

        data = _.sortBy(data, function(row){
            if( _.isFunction(row[sortBy]) )
                return row[sortBy].call();
            else
                return row[sortBy];
        });

        return sortDir == -1 ? data : data.reverse();
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

        Session.set('home_user_sort_dir', sortDir);
        Session.set('home_user_sort_by', sortBy);
    },
    "click .edit-user-btn": function(e){
        Router.go("editUser", {user_id: this._id, type: this.model_type});
    },
    "click .can-view-btn": function(e){
        var file_id = Router.current().params['file_id'],
            user = Meteor.users.findOne({_id: this._id});

        user.assignPermission(file_id, 'view');
    },
    "click .can-edit-btn": function(e){
        var file_id = Router.current().params['file_id'],
            user = Meteor.users.findOne({_id: this._id});

        user.assignPermission(file_id, 'edit');
    },
    "click .can-nothing-btn": function(e){
        var file_id = Router.current().params['file_id'],
            user = Meteor.users.findOne({_id: this._id});

        user.assignPermission(file_id, 'nothing');
    },
});