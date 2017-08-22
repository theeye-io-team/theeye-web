'use strict'

var debug = require('debug')('eye:web:events');
var snsreceiver = require('../services/snshandler');
var socketsNotifications = require('../libs/sockets-notifications')

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
    var body = req.body;
    debug('event update received');
    debug(body);

    snsreceiver.handleSubscription(body, function(error, action) {
      if (error || ! body.Message) {
        debug('Error Invalid request');
        debug(body);
        res.json({
          status: 400,
          error: { message: 'invalid request' }
        });
      } else {
        var message = snsreceiver.parseSNSMessage(body.Message);
        if (!message) {
          return res.json({
            status: 400,
            error: {
              message: "SNS body.Message Couldn't be parsed" ,
              received : body.Message
            }
          });
        } else {
          if (action == 'continue') {
            var customer = message.customer_name
            //message.last_update_moment = moment(message.last_update).startOf('second').fromNow();
            socketsNotifications.emit(customer,'resources','resource:update',message)
          }

          return res.json({ message: 'ok' });
        }
      }
    });
  }
}
