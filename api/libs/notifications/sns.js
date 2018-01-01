/* global sails */
const AWS = require('aws-sdk')
const request = require('request')
const SNS = new AWS.SNS(new AWS.Config(sails.config.aws))
// const SocketsNotifications = require('../sockets-notifications')
const debug = require('debug')('eye:libs:notifications:sns')
const sockets = require('./sockets')

module.exports = {
  send (message) {
    const topic = message.topic

    if (!sails.config.is_cluster) {
      debug('Submit SNS information via local sockets')
      sockets.emit(topic, message, (err) => {
        if (err) debug(err)
      })
    } else {
      debug('Submit SNS information')
      const sockets_arn = sails.config.sns.sockets_arn

      SNS.publish({
        TopicArn: sockets_arn,
        Message: JSON.stringify(message),
        //Subject: subject
      }, (err,data) => {
        if (err) {
          debug('error. aws sns submit failed')
          debug(err)
          return
        }

        debug(data)
      })
    }
  },
  receive (data, next) {
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
      var err = new Error('invalid request')
      next(err)
    }
  }
}
