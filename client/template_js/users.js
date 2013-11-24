
/** page_users HELPERS, EVENTS & CALLBACKS **/

Template.page_users.helpers({
    model: function() {
        if(Session.get('email_id') == 'new_email'){
            if( ['customer', 'admin'].indexOf(this.parameters.role) == -1 )
                return new EmailModel();
            else{
                var email = new EmailModel();
                email.roles = [this.parameters.role];
                return email;
            }
        }
        if(Session.get('email_id')) return Emails.findOne(Session.get('email_id'));
        return false;
    },
    showUserBtn: function(){
        return this.parameters.type == 'email';
    }
});

Template.page_users.events({
    'click #add-user-form-btn': function(e){
        console.log('add user form');
        return Session.set('email_id', 'new_email');
    }
});


/** user_add_form HELPERS, EVENTS & CALLBACKS **/

Template.user_add_form.events({
    'click .add-user-btn' : function(e){
        this.save({
            email: $('#userAddForm_email').val(),
            roles: [$('#userAddForm_role').val()],
            profile: {
                email: $('#userAddForm_email').val()
            }
        });

        Session.set('email_id', null);
    },
    'click .close-dialog-btn' : function(e){
        console.log('close user form');
        return Session.set('email_id', null);
    }
});