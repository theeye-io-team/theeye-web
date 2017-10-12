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

  const setCurrentCustomer = (customer) => {
    debug('setting active customer to "%s"', customer)
    user.current_customer = customer
    user.save(err => {
      if (err) {
        debug('unable to set current customer: %s',err.message)
        return res.status(503).send('Service Unavailable')
      }
      return next(err)
    })
  }

  const customers = user.customers
  if (!user.current_customer) {
    setCurrentCustomer(customers[0])
  } else {
    if (customers.indexOf(user.current_customer) != -1) {
      return next()
    } else {
      // customer is not available anymore.
      setCurrentCustomer(customers[0])
    }
  }
}
