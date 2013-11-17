
/** page_home HELPERS, EVENTS & CALLBACKS **/

Template.page_home.helpers({
    nullObj: {user_id: 0, file_id: 0}
});


/** page_title HELPERS, EVENTS & CALLBACKS **/

Template.page_title.helpers({
    title: function(){
        return Session.get('page_title');
    }
});