
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
    this.is_active = false;


    this.getEmail = function(){
        return this.email ? this.email : 'no email address';
    };

    this.getRole = function(){
        return this.roles && this.roles[0] ? this.roles[0] : 'customer';
    };

    this.getAttr = function(attr){
        return this.profile && this.profile[attr] ? this.profile[attr] : ' - ';
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
            //console.log('getPermission email');
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
        var oldPermRole = perm.role;

        if(role == 'view' && perm && perm.role == 'edit'){
            perm.save({role: role});
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'reader', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if(role == 'view' && perm){
            perm.save({role: perm.role == 'view' ? null : 'view'});
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'reader', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if( role == 'edit' && perm && perm.role == 'edit'){
            perm.save({role: 'view'});
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'writer', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if(role == 'edit' && perm){
            perm.save({role: 'edit'});
            Drive.call('setPermission', {fileId: fileId, value: this.email, userType: 'email', type: 'user', role: 'writer', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if( role == 'nothing' && perm ){
            perm.save({role: null});
            Drive.call('deletePermission', {fileId: fileId, value: this.email, cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }

        return true;
    }

    _.extend(this, Model);
    this.extend(doc);

    return this;
};
