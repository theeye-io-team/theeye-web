'use strict'

const request = require('request')
const logger = require('../libs/logger')('services:snshandler')

module.exports = {
  parseMessage (data, next) {
    if (typeof data != 'undefined') {
      if (data.Type && data.Type=='SubscriptionConfirmation') {
        //request(data.SubscribeURL, (err, res, body) 
        request(data.SubscribeURL, (/** args... **/) => {
          logger.debug('SNS auto-subscription done')
          logger.debug('Topic ARN ' + data.TopicArn)
          return next(null,false)
        })
      } else {
        logger.debug('Processing SNS message')
        return next(null, parseJsonMessageString(data.Message))
      }
    } else {
      logger.error('No information received')
      var err = new Error('invalid request')
      next(err)
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
