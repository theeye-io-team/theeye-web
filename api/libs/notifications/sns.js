/* global sails */
const AWS = require('aws-sdk')
const SNS = new AWS.SNS(new AWS.Config(sails.config.aws))
// const SocketsNotifications = require('../sockets-notifications')
const debug = require('debug')('eye:libs:notifications:sns')

module.exports = {
  send (message) {
    const topic = message.topic

    if (!sails.config.is_cluster) {
      debug('Submit SNS information via local sockets')

      /** @todo unify with ../controllers/EventsController.js **/
      if (topic === 'notification-crud') {
        if (Array.isArray(message.data.model)) {
          message.data.model.forEach(notification => {
            const room = `${notification.data.organization}:${notification.user_id}:${topic}`
            debug(`sending message to ${room}`)
            sails.io.sockets.in(room).emit(topic, notification)
          })
        } else {
          throw new Error('invalid notification-crud payload. array of notifications was expected')
        }
      } else {
        const room = `${message.data.organization}:${topic}`
        debug(`sending message to ${room}`)
        sails.io.sockets.in(room).emit(topic, message.data)
      }
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
  }
}
