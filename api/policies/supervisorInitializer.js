
var TheEyeClient = require('theeye-client');

module.exports = function supervisorInitializer (req, res, next) {
  /**
  sails.log.debug('passport ',  req.session.passport );
  sails.log.debug('session ',  req.session );
  sails.log.debug('user ',  req.user );
  */

  req.supervisor = new TheEyeClient({
    'api_url'         : sails.config.supervisor.url,
    'client_customer' : req.session.customer,
    'client_id'       : req.user.theeye && req.user.theeye.client_id || null,
    'client_secret'   : req.user.theeye && req.user.theeye.client_secret || null,
    'access_token'    : req.user.theeye && req.user.theeye.access_token || null
  });

  if(next) next();
}
