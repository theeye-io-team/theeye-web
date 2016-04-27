var debug = require('debug')('eye:web:services:mailer');
var ejs = require('ejs');
var config = sails.config.mailer;
var mailer = require('./lib');

module.exports = {
  sendActivationMail: function(email, input, next)
  {
    if(!email || !input) {
      return next(new Error('Missing parameters on sendActivationMail'));
    }
    var data = {
      'username' : input.username,
      'activationLink' : input.activationLink,
      'inviter': input.inviter,
      'inviter_email': input.inviter_email
    };

    ejs.renderFile("views/email/activation.ejs", { locals: data }, function(error, str) {
      if(error) {
        debug('Error parsing "views/email/activation.ejs"');
        debug(error);
        return next(error);
      }
      var options = {
        to : email,
        subject :'The Eye Invitation',
        html : str
      };

      mailer.sendMail(options, function(error, info) {
        if(error) debug("Error sending email to " + email);
        else debug('Message sent');

        return next(error);
      });
    });
  },
  sendRetrivePasswordMail: function(email, data, next)
  {

    ejs.renderFile("views/email/retrive-password.ejs", {locals: data}, function(error, str)
    {
      var options = {
        to        : email,
        subject   :'The Eye Password Restore',
        html      : str
      };

      mailer.sendMail(options, function(error, info)
      {
        if(error)
          debug("Error sending email to " + email);
        else
          debug('Message sent');

        return next(error);
      });
    });
  },
  sendRequestInvitationMail: function(email, data, next)
  {

    ejs.renderFile("views/email/invitation.ejs", {locals: data}, function(error, str) {
      var options = {
        to: config.invitation,
        subject:'The Eye Invitation',
        html: str
      };

      debug('sending invite notification email...');
      mailer.sendMail(options, function(error, info)
      {
        if(error) {
          debug("Error sending email to " + config.invitation);
          return next(error);
        } else {
          debug('Invitation message sent');
          ejs.renderFile("views/email/invitation-confirmation.ejs", {locals: data}, function(error, str)
          {
            var options = {
              to: email,
              subject:'The Eye Invitation Confirmation',
              html: str
            };

            debug('sending invite confirmation email...');
            mailer.sendMail(options, function(error, info) {
              if(error) debug("Error sending email to " + email);
              else debug('Invitation confirmation message sent');
              return next(error);
            });
          });
        }
      });
    });
  },
  sendNewCustomerMail: function(email, data, next)
  {

    ejs.renderFile("views/email/new-customer.ejs", {locals: data}, function(error, str)
    {
      var options = {
        to        : email,
        subject   :'The Eye Invitation',
        html      : str
      };

      mailer.sendMail(options, function(error, info)
      {
        if(error)
          debug("Error sending email to " + email);
        else
          debug('Message sent');

        return next(error);
      });
    });
  }
};
