/*
var key = "-----BEGIN PRIVATE KEY-----\n\
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
-----END PRIVATE KEY-----";


var GAPI = Npm.require('gapitoken');
Fiber = Npm.require("fibers");

Meteor.methods({
    googleAuth: function(params){
        Fiber(function() {
            Drive.callAuth('', {});
        }).run();
        return true;
    }
});


Drive = {
    creds: {
        iss: '709748832761-bmeg5fvet775tvluqbasa0rrgdhfb4m6@developer.gserviceaccount.com',
        scope: 'https://www.googleapis.com/auth/drive',
        key: key
    },
    gapi: {},
    call: function(cb, options){
        Drive.checkAuth(cb, options);
    },
    checkAuth: function(cb, options){
        console.log('checkAuth', Drive.gapi);
        if( !(Drive.gapi instanceof GAPI) )
            return Drive.callAuth(cb, options);


        console.log('callAuth gapi exists', Drive.gapi);

        Drive.gapi.getToken(function(token) {
            if( !token.error && (new Date(Drive.gapi.token_expires*1000-1000) > new Date()) ){
                console.log(Drive.gapi);
                if( _.isFunction(Drive[cb]) )
                    Drive[cb](options);
                return true;
            }else
                console.log(Drive.gapi);
        });

        return Drive.callAuth(cb, options);
    },
    callAuth: function(cb, options){
        console.log('callAuth', Drive.gapi);
        Fiber(function() {
            Drive.gapi = new GAPI({
                iss: Drive.creds.iss,
                scope: Drive.creds.scope,
                key: Drive.creds.key
            }, function(err) {
                if (err) { return console.log(err); }
                console.log('callAuth no error', Drive.gapi);

                Drive.gapi.getToken(function(token) {
                    if( token && (new Date(Drive.gapi.token_expires*1000-1000) > new Date()) ){
                        if( _.isFunction(Drive[cb]) )
                            Drive[cb](options);
                        else
                            return console.log('Google authentication failed.');
                    }else
                        return console.log('Have no GAPI token.');
                });
            });

        }).run();
    }
};

*/