
/** EmailModel attributes:
 *
 *  collectionName              'Emails'
 *  email                       Str
 *  profile.email               Str
 *  model_type                  Str -> 'email'
 *
 */

EmailModel = function(doc) {
    this.collectionName ='Emails';
    this.defaultValues = {
        model_type: 'email'
    };

    this.getAttr = function(attr){
        return this.profile && this.profile[attr] ? this.profile[attr] : ' - ';
    };

    this.getEmail = function(){
        return this.email ? this.email : 'no email address';
    };

    this.getName = function(){
        return this.getEmail();
    };

    this.getFirstName = function(){
        return '';
    };
    this.getLastName = function(){
        return '';
    };

    this.getAvatar = function(){
        return '/images/default-avatar.png';
    };

    this.getPermission = function(request){
        var permission = Permissions.findOne({email: this.email, file_id: request.file_id});
        if( !permission ){
            console.log('getPermission email');
            var permission_id = Permissions.insert({email: this.email, file_id: request.file_id, role: null});
            permission = Permissions.findOne(permission_id);
        }

        return permission;
    };

    this.havePermission = function(request){
        var permission = this.getPermission({file_id: request.file_id});
        if( !permission )
            return false;

        if( request.role == 'view' ){
            return ['view', 'edit'].indexOf(permission.role) > -1;
        }else
            return permission.role == 'edit';
    };

    this.isOwnerOf = function(fileId){
        return Permissions.findOne({email: this.email, file_id: fileId, role: 'owner'}) ? true : false;
    };

    this.assignPermission = function(fileId, role) {
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return;
        var perm = this.getPermission({file_id: fileId});

        if(!perm) return;

        if(role == 'view' && perm && perm.role == 'edit'){
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'reader', cb: function(){
                return perm.save({role: role});
            }});
        }else if(role == 'view' && perm){
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'reader', cb: function(){
                return perm.save({role: perm.role == 'view' ? null : 'view'});
            }});
        }else if( role == 'edit' && perm && perm.role == 'edit'){
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'writer', cb: function(){
                return perm.save({role: 'view'});
            }});
        }else if(role == 'edit' && perm){
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'writer', cb: function(){
                return perm.save({role: 'edit'});
            }});
        }else if( role == 'nothing' && perm ){
            Drive.call('deletePermission', {fileId: fileId, value: this.email, cb: function(){
                return perm.save({role: null});
            }});
        }

        return true;
    }

    _.extend(this, Model);
    this.extend(doc);

    return this;
};
