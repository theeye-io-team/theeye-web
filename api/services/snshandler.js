'use strict'

const request = require('request')
const debug = require('debug')('eye:web:services:snshandler')

module.exports = {
  parseMessage (data, next) {
    if (typeof data != 'undefined') {
      if (data.Type && data.Type=='SubscriptionConfirmation') {
        //request(data.SubscribeURL, (err, res, body) 
        request(data.SubscribeURL, (/** args... **/) => {
          debug('SNS auto-subscription done')
          debug('Topic ARN ' + data.TopicArn)
          return next(null,false)
        })
      } else {
        debug('Processing SNS message')
        return next(null, parseJsonMessageString(data.Message))
      }
    } else {
      debug('No information received')
      error = new Error('invalid request')
      next(error)
    }
  }
}

const parseJsonMessageString = (msg) => {
  try {
    return JSON.parse(msg)
  } catch (e) {
    return null
  }
}
