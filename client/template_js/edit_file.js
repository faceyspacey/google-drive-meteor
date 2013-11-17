
/** page_edit_file HELPERS, EVENTS & CALLBACKS **/

Template.page_edit_file.helpers({
    file: function(){
        return Files.findOne(this.file_id);
    },
    usersObject: function(){
        return {
            file_id: this.file_id
        };
    }
});