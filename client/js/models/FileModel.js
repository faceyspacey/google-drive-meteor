
/** FileModel attributes:
 *
 *  collectionName              'Files'
 *  _id                         Str
 *  id                          Str
 *  title                       Str
 *  createdDate                 Str
 *  iconLink                    Str (link)
 *
 *
 *  Has every fields come from google without the followings:
 *  - mimeType
 *  - exportLinks
 *
 */

FileModel = function(doc) {
    this.collectionName ='Files';
    this.defaultValues = {};

    this.getFormattedSize = function(){
        return readableFileSize(this.fileSize);
    }

    this.numeric = function(data, type){
        if( type == 'float' )
            return data != undefined ? parseFloat(data) : 0;
        else
            return data != undefined ? parseInt(data) : 0;
    }

    _.extend(this, Model);
    this.extend(doc);

    return this;
};