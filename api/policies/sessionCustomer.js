'use strict'

const debug = require('debug')('theeye:policies:has-customer')

module.exports = (req, res, next) => {
  const user = req.user

  if (!user) return next( new Error('req.user is not defined') )

  if (user.customers.length === 0) {
    debug('current user has no customers')
    return res.status(403).send('Forbidden')
  }

  debug('current customer "%s"', user.current_customer)

  if (!user.current_customer) {
    const customer = user.customers[0]
    debug('no active customer, setting "%s"', customer)
    user.current_customer = customer
    user.save(err => {
      if (err) {
        debug('unable to set current customer: %s',err.message)
        return res.status(503).send('Service Unavailable')
      }
      return next()
    })
  } else {
    const customers = user.customers
    if (customers.indexOf(user.current_customer) != -1) {
      return next()
    } else {
      debug('Forbidden. Cannot switch to customer %s', customer)
      return res.status(403).send('Forbidden')
    }
  }
}
