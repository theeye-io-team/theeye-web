var debug = require('debug')('eye:web:services:mailer');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');
var transporter = nodemailer.createTransport( sendmailTransport() );
var config = sails.config.mailer;

function Mailer(tr) {
  this.transporter = tr ;
}

Mailer.prototype = {
  sendActivationMail: function(email, input, next)
  {
    var self = this;
    var data = {
      'username' : input.username,
      'activationLink' : input.activationLink
    };

    ejs.renderFile(
      "views/email/activation.ejs",
      { locals: data },
      function(error, str) {
        var options = {
          to : email,
          subject :'The Eye Invitation',
          html : str
        };

        self.sendMail(options, function(error, info) {
          if(error) debug("Error sending email to " + email);
          else debug('Message sent');

          return next(error);
        });
      });
  },
  sendRetrivePasswordMail: function(email, data, next)
  {
    var self  = this;

    ejs.renderFile("views/email/retrive-password.ejs", {locals: data}, function(error, str)
    {
      var options = {
        to        : email,
        subject   :'The Eye Password Restore',
        html      : str
      };

      self.sendMail(options, function(error, info)
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
    var self  = this;

    ejs.renderFile("views/email/invitation.ejs", {locals: data}, function(error, str) {
      var options = {
        to: config.invitation,
        subject:'The Eye Invitation',
        html: str
      };

      debug('sending invite notification email...');
      self.sendMail(options, function(error, info)
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
            self.sendMail(options, function(error, info) {
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
    var self  = this;

    ejs.renderFile("views/email/new-customer.ejs", {locals: data}, function(error, str)
    {
      var options = {
        to        : email,
        subject   :'The Eye Invitation',
        html      : str
      };

      self.sendMail(options, function(error, info)
      {
        if(error)
          debug("Error sending email to " + email);
        else
          debug('Message sent');

        return next(error);
      });
    });
  },
  sendMail : function(options,callback)
  {
    var self = this;
    options.from = config.from;
    options.replyTo = config.replyTo;

    if( config.only_support || ! options.to ) {
      options.to = config.support.join(',');
    }
    else if( config.include_support_bcc ) {
      options.bcc = config.support.join(',');
    }

    self.transporter.sendMail(options,callback);
  }
};

module.exports = new Mailer( transporter ) ;
