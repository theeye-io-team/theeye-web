'use strict'

const debug = require('debug')('theeye:policies:supervisor-initializer')
const TheEyeClient = require('../libs/theeye-client')

module.exports = (req, res, next) => {
  const theeye = req.user.theeye

  if (!theeye) {
    debug('User TheEye Passport not present. %s.', req.user.username)
    return res.serverError('Internal Error')
  }

  if (
    ! theeye.client_id &&
    ! theeye.client_secret &&
    ! theeye.access_token
  ) {
    sails.log.error('TheEye passport is not properly created for user %s.', req.user.username)
    return res.serverError('Internal Error')
  }

  const config = {
    api_url: sails.config.supervisor.url,
    client_customer: req.user.current_customer,
    client_id:  theeye.client_id,
    client_secret: theeye.client_secret,
    access_token: theeye.access_token
  }

  req.supervisor = new TheEyeClient(config)
  if (next) next()
}
