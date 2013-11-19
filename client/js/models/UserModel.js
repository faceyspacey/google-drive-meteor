
/** UserModel attributes:
 *
 *  collectionName              'Users'
 *  model_type                  'user'
 *  _id                         Str
 *  profile {
 *      email                   Str
 *      family_name             Str
 *      gender                  Str
 *      given_name              Str
 *      id                      Str (this is the id of the user by google)
 *      locale                  Str
 *      name                    Str
 *      verified_email          Bool
 *  }
 *
 */


UserModel = function(doc){
    this.collectionName = 'Users';
    this.defaultValues = {
        model_type: 'user'
    };

    this.getEmail = function(){
        return this.profile && this.profile.email ? this.profile.email : 'no email address';
    };

    this.getAttr = function(attr){
        return this.profile && this.profile[attr] ? this.profile[attr] : ' - ';
    };

    this.getName = function(){
        return this.profile && this.profile.name ? this.profile.name : '(Unnamed)';
    };

    this.getFirstName = function(){
        return this.profile && this.profile.given_name ? this.profile.given_name : '';
    };
    this.getLastName = function(){
        return this.profile && this.profile.family_name ? this.profile.family_name : '';
    };

    this.getAvatar = function(){
        return this.profile && this.profile.picture ? this.profile.picture : '/images/default-avatar.png';
    };

    this.getPermission = function(request){
        var permission = Permissions.findOne({user_id: this._id, file_id: request.file_id});
        if( !permission ){
            //console.log('getPermission user');
            var permission_id = Permissions.insert({user_id: this._id, file_id: request.file_id, role: null});
            permission = Permissions.findOne(permission_id);
        }

        return permission;
    }

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
        return Permissions.findOne({user_id: this._id, file_id: fileId, role: 'owner'}) ? true : false;
    };

    this.assignPermission = function(fileId, role) {
        if( !Roles.userIsInRole(Meteor.userId(), ['admin']) )
            return;
        var perm = this.getPermission({file_id: fileId});

        if(!perm) return;
        var oldPermRole = perm.role;

        if(role == 'view' && perm && perm.role == 'edit'){
            perm.save({role: role});
            Drive.call('setPermission', {fileId: fileId, value: this.profile.email, userType: 'user', type: 'user', role: 'reader', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if(role == 'view' && perm){
            perm.save({role: perm.role == 'view' ? null : 'view'});
            Drive.call('setPermission', {fileId: fileId, value: this.profile.email, userType: 'user', type: 'user', role: 'reader', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if( role == 'edit' && perm && perm.role == 'edit'){
            perm.save({role: 'view'});
            Drive.call('setPermission', {fileId: fileId, value: this.profile.email, userType: 'user', type: 'user', role: 'writer', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if(role == 'edit' && perm){
            perm.save({role: 'edit'});
            Drive.call('setPermission', {fileId: fileId, value: this.profile.email, userType: 'user', type: 'user', role: 'writer', cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }else if( role == 'nothing' && perm ){
            perm.save({role: null});
            Drive.call('deletePermission', {fileId: fileId, value: this.profile.email, cb_error: function(){
                return perm.save({role: oldPermRole});
            }});
        }

        return true;
    }

    _.extend(this, Model);
    this.extend(doc);

    return this;
};