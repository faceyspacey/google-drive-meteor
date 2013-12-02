

/** user_info HELPERS, EVENTS & CALLBACKS **/

Template.user_info.helpers({
    isGoogleConfigured: function(){
        return Accounts.loginServiceConfiguration.findOne({service: 'google'}) ? true : false;
    }
});

Template.user_info.events({
    'click #logout': function(e, tmpl){
        Meteor.logout(function(err){
            if( err ) console.log(err);
            else Session.set('user_id', null);
            Router.go('home');
        });
    },
    'click #login': function(){
        Meteor.loginWithGoogle({
            requestPermissions: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile']
        });
    }
});