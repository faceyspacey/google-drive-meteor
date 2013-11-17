
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