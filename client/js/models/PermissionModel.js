
/** PermissionModel attributes:
 *
 *  collectionName              'Permissions'
 *  user_id                     Str
 *  file_id                     Str
 *  role                        Str --> ( null / view / edit / owner )
 *  email                       Str
 *  perm_id                     Str
 *
 */

PermissionModel = function(doc) {
    this.collectionName ='Permissions';
    this.defaultValues = {};


    _.extend(this, Model);
    this.extend(doc);

    return this;
};
