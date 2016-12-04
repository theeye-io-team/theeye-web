/**
 *
 * landing page contact form
 *
 */
var request = require('request');
var mailer = require("../services/mailer");

module.exports = {

  contact: function(req, res) {
    sails.log.debug("contact request");

    var params = req.body;
    var email = params.email;
    var data = {
      name: params.name,
      message: params.message,
      email: params.email
    };

    mailer.sendContactMail(email, data, function(error){
      if (error) {
        sails.log.error(error);
        return res.json({
          'status': 500,
          'error': {
            'message': error
          }
        });
      } else {
        return res.json('message sent');      
      }
    });
  }
};
