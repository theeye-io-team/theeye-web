var config = sails.config.mailer;
var nodemailer = require('nodemailer');

/**
 * http://www.nodemailer.com/
 */
var trType = config.transport.type;
var options = config.transport.options || {};
var transport;
switch(trType) {
  case 'ses':
    transport = require('nodemailer-ses-transport')(options);
    break;
  case 'sendmail':
    transport = require('nodemailer-sendmail-transport')(options);
    break;
  case 'gmail':
    transport = {
      service: 'Gmail',
      auth: {
        user: options.user,
        pass: options.pass
      }
    };
    break;
  case 'smtp':
    transport = require('nodemailer-smtp-transport')(options);
    break;
  default:
    var msg = 'nodemailer transport ' + trType + ' not implemented.';
    throw new Error(msg);
}

var transporter = nodemailer.createTransport(transport);

module.exports = {
  sendMail: function(options, callback) {
    var from = config
      .from
      .replace(/%customer%/g, options.customer_name) ;

    options.from = from;
    options.replyTo = config.reply_to;

    if( config.only_support || ! options.to ) {
      options.to = config.support.join(',');
    } else if( config.include_support_bcc ) {
      options.bcc = config.support.join(',');
    }

    transporter.sendMail(options, callback);
  }
}
