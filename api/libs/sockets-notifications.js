'use strict'

var debug = require('debug')('eye:libs:sockets-notifications')

module.exports = {
  emit (customer, topic, event, message) {
    const room = customer + ':' + topic

    debug(`sending ${event} message to ${room}`)

    sails.io.sockets
      .in(room)
      .emit(event, message)
  }
}
