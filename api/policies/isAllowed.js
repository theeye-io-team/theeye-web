'use strict'

const debug = require('debug')('theeye:policies:is-allowed')
const Acl = sails.config.acl

module.exports = (req, res, next) => {
  if (!req.user) {
    let err = new Error('req.user is not defined')
    err.status = 401
    debug(err.message)
    return next(err)
  }

  const controller = req.options.controller
  const action = req.options.action
  const credential = req.user.credential

  if (typeof (Acl[credential][controller]) === 'undefined') {
    return res.forbidden('You are not permitted to perform this action.')
  }

  if (!req.user.enabled) {
    return res.forbidden('You are not permitted to perform this action.')
  }

  if (Acl[credential][controller].indexOf(action) >= 0 || Acl[credential][controller][0] === '*') {
    return next()
  } else {
    return res.forbidden('You are not permitted to perform this action.')
  }
}
