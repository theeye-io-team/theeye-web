/**
 * hasSession
 *
 * @module      Policy
 * @description Simple policy to allow any authenticated user
 *              Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = (req, res, next) => {
  if (typeof(req.session.passport) !== 'undefined') {
    if (typeof(req.session.passport.user) !== 'undefined') {
      return next();
    } else {
      return res.redirect('/login');
    }	
  } else {
    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    // return res.forbidden('You are not permitted to perform this action.');
    return res.redirect('/login');
  }
}
