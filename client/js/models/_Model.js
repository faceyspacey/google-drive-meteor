Model = {
    errors: {},
    collection: function(){
        switch(this.collectionName){
            case 'Emails':          return Emails;
            case 'Files':           return Files;
            case 'Permissions':     return Permissions;
            case 'Users':           return Meteor.users;
        }
    },
    save: function(attributes){
        if(this._id) this.collection().update(this._id, {$set: attributes});
        else {
            var insertValues = this.prepareDefaults(attributes);
            console.log(this.collectionName, insertValues);
            this._id = this.collection().insert(insertValues);

            if(this._id) this.afterInsert();
        }
        return this._id;
    },
    refresh: function(){
        this.extend(this.collection().findOne(this._id));
    },
    afterInsert: function() {

    },
    prepareDefaults: function(attributes){
        var object = {};
        _.extend(object, this.defaultValues, attributes);
        return object;
    },
    getMongoValues: function() {
        var mongoValues = {};
        for(var prop in this) {
            if(!_.isFunction(this[prop])) mongoValues[prop] = this[prop];
        }
        delete mongoValues.errors;
        return mongoValues;
    },
    remove: function(){
        var self = this;
        this.collection().remove(this._id, function(){ self.afterRemove(); });
    },
    afterRemove: function() {
        //it's called after the object removed from database
    },
    time: function(field) {
        return moment(this[field]).format("ddd, MMM Do, h:mm a");
    },
    niceTime: function(field) {
        var time = this[field] != undefined ? this[field].replace('T', ' ').replace('Z', '') : 0,
            d = strtotime(time);
        return moment(new Date(d*1000)).format("ddd, MMM Do, h:mm a");
    },
    timeVerify: function(field) {
        return (this[field] && this[field].getTime() > 0) ? this.time(field) : 'Not yet';
    },
    extend: function(doc) {
        _.extend(this, this.defaultValues, doc);
    }
};