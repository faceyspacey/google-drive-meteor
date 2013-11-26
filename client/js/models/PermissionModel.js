
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
    _.extend(this, Model);
    this.collectionName ='Permissions';
    this.defaultValues = {};


    this.extend(doc);

    return this;
};
