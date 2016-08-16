
var TheEyeClient = require('theeye-client');

module.exports = function supervisorInitializer (req, res, next)
{
  var config = {
    'api_url': sails.config.supervisor.url,
    'client_customer': req.session.customer,
    'client_id': req.user.theeye && req.user.theeye.client_id || null,
    'client_secret': req.user.theeye && req.user.theeye.client_secret || null,
    'access_token': req.user.theeye && req.user.theeye.access_token || null
  };

  if(
    !req.user.theeye ||
    !req.user.theeye.client_id ||
    !req.user.theeye.client_secret
  ){
    sails.log.error("TheEye passport is not created for user %s.", req.user.username);
    return res.forbidden('You are not permitted to perform this action.');
  }

  req.supervisor = new TheEyeClient(config);

  if(next) next();
}
