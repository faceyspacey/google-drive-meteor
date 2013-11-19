
Drive = {
    client_id: '709748832761.apps.googleusercontent.com',
    api_key: 'AIzaSyDq5-7BC9Uzsug_pFScLo1gYn6D6jfnMZ8',
    call: function(cb, options){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return false;

        Drive.checkAuth(cb, options);
    },
    checkAuth: function(cb, options){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return false;
        if( !gapi || !gapi.auth )
            return;
        var accessToken = gapi.auth.getToken();
        if( accessToken && (new Date(accessToken.expires_at*1000-10) > new Date()) ){
            if( _.isFunction(Drive[cb]) )
                Drive[cb](options);
            return true;
        }

        var SCOPES = [  'https://www.googleapis.com/auth/drive',
                        'https://www.googleapis.com/auth/drive.file'];

        gapi.client.setApiKey(Drive.api_key);

        gapi.auth.authorize(
            {'client_id': Drive.client_id, 'scope': SCOPES.join(' '), 'immediate': false, login_hint: 'sequenciadocuments@gmail.com'},
            function(authResult){
                console.log(authResult);
                if (authResult && !authResult.error) {
                    if( _.isFunction(Drive[cb]) )
                        return Drive[cb](options);
                }else{
                    //console.log(authResult);
                    return alert('Google authorization failed.');
                }
            }
        );
    },
    refreshFiles: function(options){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return false;
        var accessToken = gapi.auth.getToken();
        //console.log('became token', accessToken);

        _.each(Meteor.users.find({perm_id: {$exists: false}}).fetch().concat(Emails.find({perm_id: {$exists: false}}).fetch()), function(user){
            gapi.client.load('drive', 'v2', function() {
                var request = gapi.client.drive.permissions.getIdForEmail({
                    'email': user.profile.email
                });
                request.execute(function(resp) {
                    if( !resp || resp.error )
                        return console.log('permissionId request failed', resp);

                    Meteor.call('refreshUserPermID', {user_id: user._id, perm_id: resp.id});
                });
            });
        });

        gapi.client.load('drive', 'v2', function() {
            //console.log('refresh files');
            var request = gapi.client.drive.files.list({
                //'pageToken': nextPageToken
            });
            request.execute(function(resp) {
                    //console.log('refresh files3', resp);
                    //console.log(resp);
                    //Meteor.call('refreshFiles', resp.items);

                    _.each(resp.items, function(item){
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

                    _.each(Files.find().fetch(), function(file){
                        Drive.call('refreshPermissions', {fileId: file._id});
                     });

                    /*Meteor.setTimeout(function(){
                        if( _.isFunction(options.cb) )
                            return options.cb();
                    }, 300);*/
            });
        });
    },
    refreshPermissions: function(options){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return false;

        //console.log('refreshPermissions');
        gapi.client.load('drive', 'v2', function() {
            //console.log(options);
            var request = gapi.client.drive.permissions.list({
                'fileId': options.fileId
            });
            request.execute(function(resp) {
                //console.log(options.fileId, resp);
                Meteor.call('refreshPermissions', resp.items, options.fileId);
                Meteor.setTimeout(function(){
                    if( _.isFunction(options.cb) )
                        return options.cb();
                }, 300);
            });
        });
    },
    refreshUsersPermissionsIDs: function(options){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return false;

        //console.log('refreshUsersPermissionsIDs');
        _.each(Meteor.users.find().fetch().concat(Emails.find().fetch()), function(user){
            gapi.client.load('drive', 'v2', function() {
                var request = gapi.client.drive.permissions.getIdForEmail({
                    'email': user.profile.email
                });
                request.execute(function(resp) {
                    if( !resp || resp.error )
                        return console.log('permissionId request failed', resp);

                    Meteor.call('refreshUserPermID', {user_id: user._id, perm_id: resp.id});

                    Meteor.setTimeout(function(){
                        if( _.isFunction(options.cb) )
                            return options.cb();
                    }, 500);

                });
            });
        });
    },
    setPermission: function(options){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return false;
        gapi.client.load('drive', 'v2', function() {
            var request = gapi.client.drive.permissions.getIdForEmail({
                'email': options.value
            });
            request.execute(function(resp) {
                if( !resp || resp.error ){
                    console.log('permissionId request failed', resp);
                    if( _.isFunction(options.cb_error) )
                        return options.cb_error();
                    return;
                }

                //console.log('getId', resp);
                var request = gapi.client.drive.permissions.get({
                    'fileId': options.fileId,
                    'permissionId': resp.id
                });
                request.execute(function(getResp) {
                    //console.log('getResp', getResp);
                    if( getResp && !getResp.error ){
                        // Update existing permission
                        getResp.role = options.role;
                        var updateRequest = gapi.client.drive.permissions.update({
                            'fileId': options.fileId,
                            'permissionId': getResp.id,
                            'resource': getResp
                        });
                        updateRequest.execute(function(udateResp) {
                            if( udateResp && !udateResp.error ){
                                if( _.isFunction(options.cb) )
                                    return options.cb();
                            }else{
                                console.log('update failed', udateResp);
                                if( _.isFunction(options.cb_error) )
                                    return options.cb_error();
                            }
                            return;
                        });
                    }else{
                        // Insert new permission
                        var body = {
                            'value': options.value,
                            'type': options.type,
                            'role': options.role
                        };
                        var sendEmail = (options.userType == 'user');
                        var request = gapi.client.drive.permissions.insert({
                            'fileId': options.fileId,
                            'resource': body,
                            'sendNotificationEmails': sendEmail
                        });
                        request.execute(function(insertResp) {
                            if( insertResp && !insertResp.error ){
                                if( _.isFunction(options.cb) )
                                    return options.cb();
                            }else{
                                console.log('insert failed', insertResp);
                                if( _.isFunction(options.cb_error) )
                                    return options.cb_error();
                            }
                            return;
                        });
                    }
                });
            });
        });
    },
    deletePermission: function(options){
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return false;
        gapi.client.load('drive', 'v2', function() {
                var request = gapi.client.drive.permissions.getIdForEmail({
                    'email': options.value
                });
            request.execute(function(resp) {
                var request = gapi.client.drive.permissions.delete({
                    'fileId': options.fileId,
                    'permissionId': resp.id
                });
                request.execute(function(deleteResp) {
                    if( deleteResp && !deleteResp.error ){
                        if( _.isFunction(options.cb) )
                            return options.cb();
                    }else{
                        console.log('delete failed', deleteResp);
                        if( _.isFunction(options.cb_error) )
                            return options.cb_error();
                    }
                    return;
                });
            });
        });
    }
}