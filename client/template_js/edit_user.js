
/** page_edit_user HELPERS, EVENTS & CALLBACKS **/

Template.page_edit_user.helpers({
    user: function(){
        if( this.model_type == 'user' )
            return Meteor.users.findOne(this.user_id);
        else
            return Emails.findOne(this.user_id);
    },
    filesObject: function(){
        return {
            user_id: this.user_id
        };
    }
});

Template.page_edit_user.events({
    'click .save-user-btn': function(){
        if( ['customer', 'admin'].indexOf($('#userAddForm_role').val()) == -1 )
            return;

        if( this.model_type == 'user' ){
            var user = Meteor.users.findOne(this.user_id);

            if( user ){
                Roles.removeUsersFromRoles(user._id, ['customer', 'admin']);
                Roles.addUsersToRoles(user._id, [$('#userAddForm_role').val()]);
            }
        }else{
            var email = Emails.findOne(this.user_id);
            if( email )
                email.save({roles: [$('#userAddForm_role').val()]});
        }
        return;
    }
});


/** role_select HELPERS, EVENTS & CALLBACKS **/

Template.role_select.helpers({
    isSelected: function(value){
        return this.getRole() == value ? 'selected="selected"' : '';
    }
});

