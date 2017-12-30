'use strict'

const debug = require('debug')('theeye:policies:passport-bearer')

module.exports = (req, res, next) => {
  // Initialize Passport
  passport.initialize()(req, res, function(){
    // Use the built-in sessions
    debug('authenticating bearer')
    passport.authenticate('bearer',{ session: false })(req, res, function(err, user){
      if (err) {
        debug(`${err.name}: ${err.message}`)
        if (err.status===401) {
          return res.status(401).send('Unauthorized')
        } else if (err.status===400) {
          return res.status(400).send('Bad Request')
        } else {
          return next(err)
        }
      }
      return next()
    })
  })
}
