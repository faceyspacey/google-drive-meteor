
Meteor.methods({
    sendWelcomeEmail: function(to) {
        var fullMessage = {
            to: to,
            from: 'sequenciadocuments@gmail.com',
            subject: 'Welcome to Sequencia Technologies Document Browser',
            html: "You have been granted access to view private Sequencia Technologies documents at: <br/><br/>"+
                '<a href="'+Meteor.absoluteUrl('home/welcome')+'">Sequencia Technologies Document Browser</a><br/><br/>' +
                'You can one-click login with the google account associated with this email.'
        };
        Email.send(fullMessage);
        return fullMessage;
    }
});