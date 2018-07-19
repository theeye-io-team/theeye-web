/**
 * hasSecret
 *
 * @module      Policy
 * @description Simple policy to allow any authenticated user
 *              Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        http://sailsjs.org/#!documentation/policies
 *
 */
const debug = require('debug')('theeye:policies:has-secret')
module.exports = (req, res, next) => {
  if (!req.query.secret) {
    return res.status(401).send('Unauthorized')
  } else if (req.query.secret !== sails.config.supervisor.incoming_secret) {
    return res.status(401).send('Unauthorized')
  } else {
    return next()
  }
}
