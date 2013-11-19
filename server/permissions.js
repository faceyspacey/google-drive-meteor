
Permissions = new Meteor.Collection('permissions');

Meteor.publish("permissions", function (){
    var user = Meteor.users.findOne(this.userId);
    if( !user )
        return;
    if(Roles.userIsInRole(this.userId, ['admin']))
        return Permissions.find({});
    else
        return Permissions.find({$or: [
            {user_id: this.userId, role: {$in: ['owner', 'edit', 'view']}},
            {email: user.profile.email, role: {$in: ['owner', 'edit', 'view']}}
        ]});
});



Permissions.allow({
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


Fiber = Npm.require("fibers");

Meteor.methods({
    refreshPermissions: function(items, fileId){

        Fiber(function(params) {
            var items = params.items,
                fileId = params.fileId,
                permissions = [];

            //console.log(items);
            _.each(items, function(item){
                if( item.type != 'user' )
                    return;

                var permId = null;
                var role = item.role == 'owner' ? 'owner' : (item.role == 'writer' ? 'edit' : 'view');
                var user = Meteor.users.findOne({$or: [{"profile.email": item.emailAddress}, {perm_id: item.id}]});
                if( user ){
                    //console.log('userId', user._id);
                    //console.log('user', item.role, role);
                    var perm = Permissions.findOne({file_id: fileId, user_id: user._id});
                    if( !perm )
                        permId = Permissions.insert({file_id: fileId, user_id: user._id, role: role, perm_id: user.perm_id});
                    else
                        Permissions.update(perm._id, {$set: {role: role}});
                    permId = perm._id;
                }else{
                    //console.log('email', item.role, role);
                    user = Emails.findOne({email: item.emailAddress});
                    if( user ){
                        //console.log('userEmail', user.email);
                        var perm = Permissions.findOne({file_id: fileId, $or: [{user_id: user._id}, {perm_id: item.id}]});
                        if( !perm )
                            permId = Permissions.insert({file_id: fileId, email: user.email, role: role, perm_id: item.id});
                        else
                            Permissions.update(perm._id, {$set: {role: role}});
                        permId = perm._id;
                    }
                }

                if( permId != null )
                    permissions.push(permId);

                //console.log(Permissions.find().count());
            });

            
            Permissions.find({_id: {$nin: permissions}, file_id: fileId}).forEach(function(perm){ Permissions.remove(perm._id); });

        }).run({items: items, fileId: fileId});

        return true;
    },
    reassignPermissions: function(user){
        var email = user.profile.email;

        Fiber(function() {
            Emails.find({email: email}).forEach(function(em){
                Emails.remove(em._id);
            });
            Permissions.find({email: email}).forEach(function(permission){
                Permissions.update(permission._id, {$set: {email: '', user_id: user._id}});
            });
        }).run();

        return true;
    }
});