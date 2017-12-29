/* global sails */
'use strict'

const debug = require('debug')('eye:web:events')
const snsreceiver = require('../services/snshandler')
// const socketsNotifications = require('../libs/sockets-notifications')

module.exports = {
  /**
  * Overrides for the settings in `config/controllers.js`
  * (specific to EventsController)
  */
  _config: {
    shortcurts: false,
    rest: false
  },
  /**
   *
   * SNS handle messages
   *
   */
  update (req, res) {
    var body = req.body
    debug('sns event received')
    debug(body)

    snsreceiver.parseMessage(body, (err, message) => {
      if (err) {
        debug('ERROR: Message parse error')
        debug(err.message)
        return res.json({
          status: 400,
          error: { message: 'invalid request' }
        })
      }

      if (!message) {
        debug('ERROR: NO SNS Message')
        return res.json({
          status: 400,
          error: {
            message: 'SNS Message Couldn\'t be parsed',
            received: body.Message
          }
        })
      }

      if (!message.topic) {
        debug('ERROR: NO topic in Message')
        return res.json({
          status: 400,
          error: {
            message: 'SNS Message.topic is required',
            received: body.Message
          }
        })
      }

      debug('processing message.topic %s', message.topic)

      if (message.topic === 'notification-crud') {
        if (Array.isArray(message.data.model)) {
          message.data.model.forEach(notification => {
            const room = `${notification.organization}:${notification.user_id}:${message.topic}`
            sails.io.sockets.in(room).emit(message.topic, notification.data)
          })
        } else {
          debug('ERROR: invalid notification structure. Array expected, received', message.data.model)
          return res.json({
            status: 400,
            error: {
              message: 'Invalid notification message structure.',
              received: body.Message
            }
          })
        }
      } else {
        const room = `${message.data.organization}:${message.topic}`
        // we're sending the whole message again, not just it's .data prop ?
        sails.io.sockets.in(room).emit(message.topic, message.data)
      }

      return res.json('ok')
    })
  }
}
