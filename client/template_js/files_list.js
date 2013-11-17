
/** files_list HELPERS, EVENTS & CALLBACKS **/

Template.files_list.helpers({
    filesCount: function(userId){
        var data = [];

        if( !userId )
            data = Files.find().fetch();
        else{
            var fileIDs = _.pluck(Permissions.find({$or: [{user_id: userId},{email: userId}]}).fetch(), "file_id");
            data = Files.find({_id: {$in: fileIDs}}).fetch();
        }

        return data.length;
    },
    files: function(userId) {
        var sortBy = Session.get('home_file_sort_by'),
            sortDir = Session.get('home_file_sort_dir'),
            data = [];


        if( sortBy == undefined ){
            Session.set('home_file_sort_dir', 1);
            Session.set('home_file_sort_by', 'title');
        }

        if( !userId )
            data = Files.find().fetch();
        else{
            var fileIDs = _.pluck(Permissions.find({$or: [{user_id: userId},{email: userId}]}).fetch(), "file_id");
            data = Files.find({_id: {$in: fileIDs}}).fetch();
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
        var sortBy = Session.get('home_file_sort_by'),
            sortDir = Session.get('home_file_sort_dir');
        if( sortBy == field )
            return sortDir > -1 ? 'sorted-asc' : 'sorted-desc';
        else
            return '';
    }
});

Template.files_list.events({
    "click .sortable": function(e) {
        var sortBy = Session.get('home_file_sort_by'),
            sortDir = Session.get('home_file_sort_dir'),
            table = $(e.target).parents().filter('table.table');

        sortBy = $(e.target).data('field');
        if( sortDir == undefined )
            sortDir = 1;
        else
            sortDir = -1*sortDir;

        $(table).find('.sortable').removeClass('sorted-asc').removeClass('sorted-desc');
        $(e.target).addClass('sorted-'+(sortDir > -1 ? 'asc' : 'desc'));

        Session.set('home_file_sort_dir', sortDir);
        Session.set('home_file_sort_by', sortBy);
    },
    "click .edit-file-btn": function(e){
        Router.go("editFile", {file_id: this._id});
    },
    "click .files-refresh-btn": function(e){
        Drive.call('refreshFiles', {});
    },
    "click .can-view-btn": function(e){
        var user_id = Router.current().params['user_id'],
            model_type = Router.current().params['model_type'],
            user = model_type == 'user' ? Meteor.users.findOne({_id: user_id}) : Emails.findOne({_id: user_id});

        user.assignPermission(this._id, 'view');
    },
    "click .can-edit-btn": function(e){
        var user_id = Router.current().params['user_id'],
            model_type = Router.current().params['model_type'],
            user = model_type == 'user' ? Meteor.users.findOne({_id: user_id}) : Emails.findOne({_id: user_id});

        user.assignPermission(this._id, 'edit');
    },
    "click .can-nothing-btn": function(e){
        var user_id = Router.current().params['user_id'],
            model_type = Router.current().params['model_type'],
            user = model_type == 'user' ? Meteor.users.findOne({_id: user_id}) : Emails.findOne({_id: user_id});

        user.assignPermission(this._id, 'nothing');
    },
});