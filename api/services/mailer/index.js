/* global sails */
var ejs = require('ejs');
var config = sails.config.mailer;
var mailer = require('./lib');

module.exports = {
  sendActivationMail: function(input, next) {
    var data = { locals: input };
    ejs.renderFile("views/email/activation.ejs", data, function(error, html) {
      if(error) {
        sails.log.error('Error parsing "views/email/activation.ejs"');
        sails.log.error(error);
        return next(error);
      }

      var options = {
        'to': input.invitee.email,
        'subject': 'The Eye Invitation',
        'html': html
      };

      mailer.sendMail(options, function(error, info) {
        if(error) sails.log.error("Error sending email to " + input.invitee.email);
        else sails.log.debug('Message sent');
        return next(error);
      });
    });
  },
  sendPasswordRecoveryEMail: function(data, next) {
    ejs.renderFile("views/email/retrive-password.ejs", {
      locals: data
    }, function(error, html) {
      var options = {
        to: data.user.email,
        subject: 'The Eye Password Restore',
        html: html 
      };

      mailer.sendMail(options, function(error, info) {
        if(error) sails.log.error("Error sending email to " + email);
        else sails.log.debug('Message sent');
        return next(error);
      });
    });
  },
  sendRequestInvitationMail: function(email, data, next) {
    ejs.renderFile("views/email/invitation.ejs", {locals: data}, function(error, html
    ) {
      var options = {
        to: config.invitation,
        subject:'The Eye Invitation',
        html:html 
      };

      sails.log.debug('sending invite notification email...');
      mailer.sendMail(options, function(error, info) {
        if(error) {
          sails.log.error("Error sending email to " + config.invitation);
          return next(error);
        } else {
          sails.log.debug('Invitation message sent');
          ejs.renderFile("views/email/invitation-confirmation.ejs", {locals: data}, function(error, html) {
            var options = {
              to: email,
              subject:'The Eye Invitation Confirmation',
              html:html 
            };

            sails.log.debug('sending invite confirmation email...');
            mailer.sendMail(options, function(error, info) {
              if(error) sails.log.error("Error sending email to " + email);
              else sails.log.debug('Invitation confirmation message sent');
              return next(error);
            });
          });
        }
      });
    });
  },
  sendNewCustomerEMail: function(user, next) {
    ejs.renderFile("views/email/customer-invitation.ejs", {locals: user}, function(error, html) {
      var options = {
        to: user.email,
        subject:'The Eye Invitation',
        html:html 
      };
      mailer.sendMail(options, error => next(error));
    });
  },
  sendCustomerPermissionsChanged: function(user, next) {
    ejs.renderFile("views/email/customer-permissions.ejs", {locals: user}, function(error, html) {
      var options = {
        to: user.email,
        subject:'The Eye Profile Alert',
        html:html 
      };
      mailer.sendMail(options, error => next(error));
    });
  }
};
