/**
 *
 * @type {{getAdmins: Function}}
 */

Collections = {

    getAdmins: function(params){
        params = params ? params : {};
        return Meteor.users.find({roles: ['admin'], verified_user: (params.unverified ? false : true)}).fetch().concat(Emails.find({roles: ['admin']}).fetch());
    },
    getAdminsCount: function(params){
        params = params ? params : {};
        return this.getAdmins(params).length;
    },
    getCustomers: function(params){
        params = params ? params : {};
        return Meteor.users.find({roles: ['customer'], verified_user: (params.unverified ? false : true)}).fetch().concat(Emails.find({roles: ['customer']}).fetch());
    },
    getCustomersCount: function(params){
        params = params ? params : {};
        return this.getCustomers(params).length;
    },
    getOnlyUsers: function(params){
        params = params ? params : {};
        return Meteor.users.find({verified_user: (params.unverified ? false : true)}).fetch();
    },
    getUsers: function(params){
        params = params ? params : {};
        if( params == 'ALL' )
            return Meteor.users.find().fetch().concat(Emails.find().fetch());

        return Meteor.users.find({verified_user: (params.unverified ? false : true)}).fetch().concat(Emails.find().fetch());
    },
    getUsersCount: function(params){
        params = params ? params : {};
        return this.getUsers(params).length;
    },
    getUsersByParams: function(params){
        params = params ? params : {};
        var data = [];

        //console.log(params);
        if( params.type == 'user' )
            data = this.getOnlyUsers(params);
        else if( params.role == 'admin' )
            data = this.getAdmins(params);
        else if( params.role == 'customer' )
            data = this.getCustomers(params);
        else
            data = this.getUsers(params);

        return data;
    }


};