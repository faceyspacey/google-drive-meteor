
Handlebars.registerHelper('canDo', function(role, fileId){
    var userId = Router.current().params['user_id'],
        user = Meteor.users.findOne({_id: userId});

    if( !user )
        user = Emails.findOne(userId);

    if( !user )
        return 'btn-default';

    if( role == 'nothing' )
        return user.havePermission({file_id: fileId, role: 'view'}) ? 'btn-warning' : 'btn-default';
    else
        return user.havePermission({file_id: fileId, role: role}) ? 'btn-success' : 'btn-default';
});

Handlebars.registerHelper('canDoWithFile', function(role, userId){
    var fileId = Router.current().params['file_id'],
        user = Meteor.users.findOne(userId);

    if( !user )
        user = Emails.findOne(userId);

    if( !user )
        return 'btn-default';

    if( role == 'nothing' )
        return user.havePermission({file_id: fileId, role: 'view'}) ? 'btn-warning' : 'btn-default';
    else
        return user.havePermission({file_id: fileId, role: role}) ? 'btn-success' : 'btn-default';
});

Handlebars.registerHelper('isUserOwner', function(fileId){
    var userId = Router.current().params['user_id'],
        user = Meteor.users.findOne(userId);

    if( !user )
        user = Emails.findOne(userId);

    if( !user )
        return false;

    return user.isOwnerOf(fileId);
});

Handlebars.registerHelper('isFileOwned', function(userId){
    var fileId = Router.current().params['file_id'],
        user = Meteor.users.findOne(userId);

    if( !user )
        user = Emails.findOne(userId);

    if( !user )
        return false;

    return user.isOwnerOf(fileId);
});

Handlebars.registerHelper('canAdminShareIt', function(fileId){
    var fileId = fileId ? fileId : Router.current().params['file_id'],
        user = Meteor.users.findOne({"profile.email": 'sequenciadocuments@gmail.com'});

    if( !user )
        return false;

    return user.havePermission({file_id: fileId, role: 'edit'}) || user.isOwnerOf(fileId);
});

initializeSidebar = function(){
    $(function() {
        console.log();
        console.log('activating accordion');
        $("ul#nav").accordion({
            heightStyle: 'content',
            active: getNumOfActiveMenuItem(),
            header: 'a.acc-opener',
            collapsible: true
        });
    });
}

function getNumOfActiveMenuItem(){
    var items = [];
    var activeItem = $('ul#nav > li.current > a.acc-opener')[0];
    for( var i = 0; i < $('ul#nav > li > a.acc-opener').length; i++){
        items.push($('ul#nav > li > a.acc-opener')[i]);
    }
    var num = items.indexOf(activeItem);
    return num > -1 ? num : false;
}

