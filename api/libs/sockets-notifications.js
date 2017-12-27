/* global sails */
'use strict'

var debug = require('debug')('eye:libs:sockets-notifications')

module.exports = {
  emit (room, topic, message) {
    debug(`sending topic ${topic} event to ${room}`)
    sails.io.sockets.in(room).emit(topic, message)
  }
}
