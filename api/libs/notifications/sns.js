/* global sails */
const AWS = require('aws-sdk')
const SNS = new AWS.SNS(new AWS.Config(sails.config.aws))
// const SocketsNotifications = require('../sockets-notifications')
const debug = require('debug')('eye:libs:notifications:sns')

module.exports = {
  send (input) {
    const topic = input.topic
    const message = input.data

    if (!sails.config.is_cluster) {
      debug('Submit SNS information via local sockets')

      if (topic === 'notification-crud') {
        if (Array.isArray(message.model)) {
          message.model.forEach(notification => {
            const room = `${notification.data.organization}:${notification.user_id}:${topic}`
            sails.io.sockets.in(room).emit(topic, notification)
          })
        } else {
          throw new Error('invalid notification-crud payload. array of notifications was expected')
        }
      } else {
        const room = `${message.organization}:${topic}`
        sails.io.sockets.in(room).emit(topic, message)
      }
    } else {
      debug('Submit SNS information')
      const sockets_arn = sails.config.sns.sockets_arn
      const params = { form: { Message: message } }

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
