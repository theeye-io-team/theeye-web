//Nuevo controller solo para el envio de emails desde la landing page.

var request = require('request');
var mailer = require("../services/mailer.js");

var debug = {
  log: require('debug')('eye:web:contact'),
  error: require('debug')('eye:web:contact:error')
};

module.exports = {

  invitation: function(req, res)
  {
    debug.log("invitation request");

    var params = req.body;
    var email  = params.email;
    var data   = {name: params.name, message: params.message, email: params.email};

    mailer.sendRequestInvitationMail(email, data, function(error){
      if(error) {
        debug.error(error);
        return res.json('message sent');      
      }  
      else return res.json({'status': 500,'error': {'message': error} });      
    });
  }
};
