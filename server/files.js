
Files = new Meteor.Collection('files');

Meteor.publish("files", function (){
    var user = Meteor.users.findOne(this.userId);
    if( !user )
        return;
    if(Roles.userIsInRole(this.userId, ['admin'])) return Files.find({}); // everything
    else{
        var permittedFiles = _.pluck(Permissions.find({$or: [
            {user_id: this.userId, role: {$in: ['owner', 'edit', 'view']}},
            {email: user.profile.email, role: {$in: ['owner', 'edit', 'view']}}
        ]}).fetch(), 'file_id');
        return Files.find({_id: {$in: permittedFiles}});
    }
});


Files.allow({
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
/*
Meteor.methods({
    refreshFiles: function(items){

        Fiber(function(items) {
            _.each(items, function(item){
                var file = Files.findOne(item.id);
                if( file ){
                    _.extend(file, item);
                    delete file._id;
                    delete file.mimeType;
                    delete file.exportLinks;
                    //console.log('update', item);
                    Files.update(file.id, {$set: file});
                }else{
                    file = item;
                    file._id = file.id;
                    delete file.mimeType;
                    delete file.exportLinks;
                    //console.log('insert', item);
                    var file_id = Files.insert(file);
                    file = Files.findOne(file_id);
                }
            });
        }).run(items);

        return true;
    }
});*/