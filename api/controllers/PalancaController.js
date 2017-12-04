'use strict'

var snsreceiver = require('../services/snshandler');
var socketsNotifications = require('../libs/sockets-notifications')

module.exports = {
  _config: {
    shortcurts: false,
    rest: false
  },
  index (req, res) {
    res.view(); // template render
  },
  /**
   * Receive SNS messages, automatically sent by the supervisor.
   */
  update (req, res, next) {
    // sns updates received
    var body = req.body;

    snsreceiver.handleSubscription(body, function(error, action) {
      if (error||!body.Message) {
        sails.log.error('Error Invalid request');
        sails.log.error(body);
        return res.json({
          status: 400,
          error: { message: 'invalid request' } 
        })
      } else {
        var result = snsreceiver.parseSNSMessage(body.Message);
        if (!result) {
          return res.json({
            status: 400,
            error: {
              message: 'SNS body.Message Couldn\'t be parsed' ,
              received: body.Message
            }
          });
        }

        if (action == 'continue') {
          var customer = result.customer_name
          var message = result
          socketsNotifications.emit(customer,'jobs','job:update',message)
        }

        return res.json({ message: 'ok' });
      }
    })
  }
}
