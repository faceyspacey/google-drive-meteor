
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
    'click .save-user-btn': function(e){
        if( ['customer', 'admin'].indexOf($('#userUpdateForm_role').val()) == -1 )
            return alert('This role does not exists in the system.');

        var container = $('#edit-user-profile-right-cont');
        container.prepend('<div class="loading-indicator"></div>');
        Meteor.setTimeout((function(){ return container.find('.loading-indicator').remove(); }), 1000);

        if( this.model_type == 'user' ){
            var user = Meteor.users.findOne(this.user_id);

            if( user ){
                Roles.removeUsersFromRoles(user._id, ['customer', 'admin']);
                Roles.addUsersToRoles(user._id, [$('#userUpdateForm_role').val()]);
            }
        }else{
            var email = Emails.findOne(this.user_id);
            if( email )
                email.save({roles: [$('#userAddForm_role').val()]});
        }
    }
});


/** role_select HELPERS, EVENTS & CALLBACKS **/

Template.role_select.helpers({
    isSelected: function(value){
        return this.getRole() == value ? 'selected="selected"' : '';
    }
});

