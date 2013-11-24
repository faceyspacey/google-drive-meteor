
ConsoleMe.enabled = false;

//console.log(NodeModules);

//NodeModules.setPath('/public');
//var GAPI = Npm.require('gapitoken');
//console.log('GAPI: ', GAPI);
const calRoot = "https://www.googleapis.com/drive/v2";
const request = Npm.require('request');

Fiber = Npm.require("fibers");

Meteor.methods({
    refreshFiles: function(options){
        Fiber(function() {
            Drive.call('refreshFiles', options);
        }).run();
        return true;
    },
    deleteFile: function(options){
        Fiber(function() {
            Drive.call('deleteFile', options);
        }).run();
        return true;
    },
    setPermission: function(options){
        Fiber(function() {
            console.log('setPermission call');
            Drive.call('setPermission', options);
        }).run();
        return true;
    },
    deletePermission: function(options){
        Fiber(function() {
            Drive.call('deletePermission', options);
        }).run();
        return true;
    },
    gAuth: function(params){
        Fiber(function() {
            Drive.listFiles2();
        }).run();
    }
});


Drive = {
    creds: {
        //iss: 'sequenciadocuments@gmail.com',
        iss: '709748832761-bmeg5fvet775tvluqbasa0rrgdhfb4m6@developer.gserviceaccount.com',
        scope: 'https://www.googleapis.com/auth/drive',
        key: "-----BEGIN RSA PRIVATE KEY-----\n\
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALnKF0sk/YB34fMq\n\
BYqo+/pZvGL+PgZoa6n4SLZmJPri1GqwtrgBn1UWbXxynXqyIly0/scKCL/lXpCr\n\
wCRdABBb89TUTfuXnrsZXxW4/t6IhrXMH4JY2nRVxFHocw+b+B4KNU9hz1MLLRxd\n\
+Kuewn5ErAJkM+YFhuFbUZzPQ/LjAgMBAAECgYBR3N8oqDLfAXPY3kI018K3jAS7\n\
JcWUszwFV7ZKUHWo6nuoSxcnuudG6avycto67vS/Hq1IbH5wd5OUcWknXKcizZXX\n\
scKa8gpkFKGDE6Uty/jAzGRDbf0bSSaz0X6DYshNaBuWYe5d5KNFxteWU66sda+8\n\
7lGMoVpmLiPHpvgnkQJBAOjwf83+qE6Jgwe+FqbiQRLzBmN+JG7mgANyNiofcWZ0\n\
EU8bR3yiFyJ6BTuLErptEbJjoNjz1bSZ49PLTpMjdksCQQDMLqUbfriiq+ZHSNx8\n\
e56OptF8NoZzv6f9cg8L+U81cFT19SyFhgd/einP+ojTaPh4QLdOJanlwRXQsr+m\n\
QPbJAkEAtyPO9+BN52GKGV5EZPTiAMn9rd+ROXgUEaGMIFYUTF7Y9P8Xl0/BLKQO\n\
1R+km9oA3eYiojAjRxju3KetoVVyPQJAck1qgIngMrCoqR9Qzx8lFBavDyo2+nVA\n\
RdGkOr/GZ9QKu+YUlmsBp4tr/NHz5uXMswUHmOfcxJHi9IIcZ6XWgQJAUQfz+vq0\n\
KU6HP20FjC/zdbane4OdG0MEHU9ZpOSMrEg2MUhRataZQsfS8uriVGB9A3vmZs7R\n\
CGEPQPbVcfqz+g==\n\
-----END RSA PRIVATE KEY-----"
    },
    gapi: null,
    call: function(cb, options){
        Drive.checkAuth(cb, options);
    },
    checkAuth: function(cb, options){
        if( Drive.gapi == null )
            return Drive.callAuth(cb, options);

        Drive.gapi.getToken(function(token) {
            if( token == null && Drive.gapi && (new Date(Drive.gapi.token_expires*1000-1000) > new Date()) ){
                if( _.isFunction(Drive[cb]) )
                    Drive[cb](options);
                return true;
            }
        });

        return Drive.callAuth(cb, options);
    },
    callAuth: function(cb, options){
        Drive.gapi = new GAPI({
            iss: Drive.creds.iss,
            scope: Drive.creds.scope,
            key: Drive.creds.key
        }, function(err) {
            if (err) { return console.log(err); }

            Drive.gapi.getToken(function(token) {
                if( token == null && (new Date(Drive.gapi.token_expires*1000-1000) > new Date()) ){
                    if( _.isFunction(Drive[cb]) )
                        Drive[cb](options);
                    else
                        return console.log('No callback');
                }else
                    return console.log('Have no GAPI token.');
            });
        });
    },
    refreshFiles: function(options){
        var token = "?access_token="+Drive.gapi.token;

        Fiber(function() {
            _.each(Meteor.users.find().fetch().concat(Emails.find().fetch()), function(user){
                request.get({
                    url: calRoot+"/permissionIds/"+user.profile.email+""+token,
                    json:true,
                }, function(err, res, body){
                    if( body.error ) return console.log(body);

                    Fiber(function() {
                        if( user.model_type == 'user' )
                            Meteor.users.update(user._id, {$set: {perm_id: body.id}});
                        else
                            Emails.update(user._id, {$set: {perm_id: body.id}});
                    }).run();
                });
            });
        }).run();


        request.get({
            url: calRoot+"/files"+token,
            json:true,
        }, function(err, res, body){
            if( body.error ) return console.log(body);

            Fiber(function() {
                var files = [];
                _.each(body.items, function(item){
                    var file_id = null;
                    var file = Files.findOne(item.id);
                    if( file ){
                        _.extend(file, item);
                        delete file._id;
                        delete file.mimeType;
                        delete file.exportLinks;
                        file_id = file.id;
                        Files.update(file.id, {$set: file});
                    }else{
                        file = item;
                        file._id = file.id;
                        delete file.mimeType;
                        delete file.exportLinks;
                        file_id = Files.insert(file);
                        file = Files.findOne(file_id);
                    }

                    if( file_id != null && file_id != undefined)
                        files.push(file_id);
                });

                _.each(Files.find({_id: {$nin: files}}).fetch(), function(file){
                    Files.remove(file._id);
                });

                _.each(Permissions.find({file_id: {$nin: files}}).fetch(), function(perm){
                    Permissions.remove(perm._id);
                });

                _.each(Files.find().fetch(), function(file){
                    Drive.call('refreshPermissions', {fileId: file._id});
                });
            }).run();
        });
    },
    refreshPermissions: function(options){
        var token = "?access_token="+Drive.gapi.token;

        request.get({
            url: calRoot+"/files/"+options.fileId+"/permissions"+token,
            json:true,
        }, function(err, res, body){
            if( body.error ) return console.log(body);

            Fiber(function() {
                Meteor.call('refreshPermissions', body.items, options.fileId);
            }).run();
        });

        return true;
    },
    deleteFile: function(options){
        var token = "?access_token="+Drive.gapi.token;

        request.del({
            url: calRoot+"/files/"+options.fileId+""+token,
            json:true,
        }, function(err, res, body){
            if( body ) return console.log(body);

            Fiber(function() {
                Files.remove(options.fileId);
                _.each(Permissions.find({file_id: options.fileId}).fetch(), function(perm){
                    Permissions.remove(perm._id);
                });
            }).run();
        });

        return true;
    },
    setPermission: function(options){
        var token = "?access_token="+Drive.gapi.token;

        Fiber(function() {
            request.get({
                url: calRoot+"/permissionIds/"+options.value+""+token,
                json:true,
            }, function(err, res, body){
                if( body.error ) return console.log(body);

                request.get({
                    url: calRoot+"/files/"+options.fileId+"/permissions/"+body.id+""+token,
                    json:true,
                }, function(err, res, body){
                    if( body.error && body.error.code != 404 ) return console.log(body);

                    if( body.error && body.error.code == 404  ){
                        request.post({
                            url: calRoot+"/files/"+options.fileId+"/permissions"+token,
                            json:true,
                            body: {
                                value: options.value,
                                type: options.type,
                                role: options.role
                            }
                        }, function(err, res, body){
                            if( body.error ) return console.log(body);

                            setPermission(options, body);
                        });
                    }else{
                        request.put({
                            url: calRoot+"/files/"+options.fileId+"/permissions/"+body.id+""+token,
                            json:true,
                            body: {
                                role: options.role
                            }
                        }, function(err, res, body){
                            if( body.error ) return console.log(body);

                            setPermission(options, body);
                        });
                    }

                });
            });
        }).run();

        return true;
    },
    deletePermission: function(options){
        var token = "?access_token="+Drive.gapi.token;

        request.get({
            url: calRoot+"/permissionIds/"+options.value+""+token,
            json:true,
        }, function(err, res, body){
            //console.log(err, body);
            if( !body.id || body.error ) return console.log(body);

            request.del({
                url: calRoot+"/files/"+options.fileId+"/permissions/"+body.id+""+token,
                json:true,
            }, function(err, res, body){
                //console.log(body);
                if( !body.id || body.error ) return console.log(body);

                if( options.userType == 'user'){
                    var user = Meteor.users.findOne({"profile.email": options.value});
                    var perm = Permissions.findOne({$or: [
                        {user_id: user._id, file_id: options.fileId},
                        {perm_id: body.id, file_id: options.fileId}
                    ]});
                }else{
                    var perm = Permissions.findOne({$or: [
                        {email: options.value, file_id: options.fileId},
                        {perm_id: body.id, file_id: options.fileId}
                    ]});
                }
                //console.log(perm);

                Fiber(function() {
                    if( perm )
                        Permissions.remove(perm._id);
                }).run();
            });
        });

        return true;
    }
};

function setPermission(options, body){
    var role = body.role == 'owner' ? 'owner' : (body.role == 'writer' ? 'edit' : 'view');

    Fiber(function() {
        if( options.userType == 'user'){
            var user = Meteor.users.findOne({"profile.email": options.value});
            var perm = Permissions.findOne({$or: [
                {user_id: user._id, file_id: options.fileId},
                {perm_id: body.id, file_id: options.fileId}
            ]});

            if( perm )
                Permissions.update(perm._id, {$set: {role: role}});
            else
                Permissions.insert({user_id: user._id, file_id: options.fileId, perm_id: body.id});
        }else{
            var user = Emails.findOne({email: options.value});
            var perm = Permissions.findOne({$or: [
                {email: options.value, file_id: options.fileId},
                {perm_id: body.id, file_id: options.fileId}
            ]});

            if( perm )
                Permissions.update(perm._id, {$set: {role: role}});
            else
                Permissions.insert({email: options.value, file_id: options.fileId, perm_id: body.id});
        }
    }).run();
}