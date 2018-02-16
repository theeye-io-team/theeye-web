/* global sails */
const logger = require('../libs/logger')('controllers:events')
const sns = require('../libs/notifications/sns')
const sockets = require('../libs/notifications/sockets')

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
    logger.debug('sns event received')

    sns.receive(body, (err, message) => {
      if (err) {
        logger.error('Message parse error %s', err.message)
        return res.json({
          status: 400,
          error: { message: 'invalid request' }
        })
      }

      if (!message) {
        logger.error('NO SNS Message')
        return res.json({
          status: 400,
          error: {
            message: 'SNS Message Couldn\'t be parsed',
            received: body.Message
          }
        })
      }

      if (!message.topic) {
        logger.error('NO topic in Message')
        return res.json({
          status: 400,
          error: {
            message: 'SNS Message.topic is required',
            received: body.Message
          }
        })
      }

      logger.debug('processing message.topic %s', message.topic)

      sockets.emit(message.topic, message, (err) => {
        if (err) {
          return res.json({
            status: 400,
            error: {
              message: err.message,
              received: body.Message
            }
          })
        }
      })

      return res.json('ok')
    })
  }
}
