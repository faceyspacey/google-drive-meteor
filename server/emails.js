
Emails = new Meteor.Collection('emails');

Meteor.publish("emails", function (){
    var user = Meteor.users.findOne(this.userId);
    if( !user )
        return;
    if(Roles.userIsInRole(this.userId, ['admin'])) return Emails.find({}); // everything
    else return Emails.find({email: user.profile.email});
});


Emails.allow({
    insert: function(userId, doc) {
        return Roles.userIsInRole(userId, ['admin']);
    },
    update: function(userId, doc, fields, modifier) {
        return Roles.userIsInRole(userId, ['admin']);
    },
    remove: function(userId, doc) {
        return Roles.userIsInRole(userId, ['admin']);
    }
});