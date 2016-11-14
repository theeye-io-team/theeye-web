var Acl = sails.config.acl;

module.exports = function isAllowed (req, res, next) {
  if(!req.user)	
    return next();

  var controller = req.options.controller;
  var action = req.options.action;
  var credential = req.user.credential;

  if (typeof(Acl[credential][controller]) === 'undefined')
    return res.forbidden('You are not permitted to perform this action.');

  if (!req.user.enabled)	
    return res.forbidden('You are not permitted to perform this action.');

  if (Acl[credential][controller].indexOf(action) >= 0 || Acl[credential][controller][0] === '*')
    return next();
  else
    return res.forbidden('You are not permitted to perform this action.');
}
