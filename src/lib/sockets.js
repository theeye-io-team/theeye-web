/**
 *
 * Simple socket connector.
 * how to use
 *
 *  // connect sockets and start listening to events
 *  SocketsWrapper({
 *    io: window.io,
 *    query: {
 *      param: 'a custom param', 
 *    },
 *    onSubscribed:function(data,jwres){
 *      logger.debug('subscribed to event updates');
 *    },
 *    events: {
 *      'event-name': function eventHandler(data) {
 *      },
 *      'another-event': function ... (data) {
 *      }
 *    }
 *  });
 *
 */

import Events from 'ampersand-events'
import assign from 'lodash/assign'
const logger = require('lib/logger')('eye::sockets')

function SocketsWrapper (options) {

  // only instances can extended its own prototype
  if ( ! (this instanceof SocketsWrapper) ) {
    return new SocketsWrapper(options)
  }

  const self = this

  assign(this, Events)

  this.subscriptions = []
  this.io = options.io
  const socket = this.socket = io.socket

  for (let event in options.events) {
    socket.on(event, function (message) {
      options.events[event](message)
    })
  }

  // extend
  var emit = socket.emit
  socket.emit = function () {
    logger.debug('socket emit %s, %o', arguments[0], arguments)
    emit.apply(socket, arguments)
  }

  var $emit = socket.$emit
  socket.$emit = function () {
    logger.debug('socket event %s, %o', arguments[0], arguments)
    $emit.apply(socket, arguments)
    self.trigger(arguments[0], arguments[1])
  }

  socket.on('connect', function () {
    logger.debug('socket connected')
    self.trigger('connected')
  })

  socket.on('disconnect', function () {
    logger.debug('socket disconnected')
    self.trigger('disconnected')
  })

  return this
}

SocketsWrapper.prototype.connected = function () {
  let socket = this.socket
  return socket.socket && socket.socket.connected
}

SocketsWrapper.prototype.subscribe = function ({ query, onSubscribed }) {
  let subscriptions = this.subscriptions

  const subscribe = () => {
    logger.debug('subscribing...')
    this.socket.post('/sockets/subscribe', query, function (data, jwt) {
      Array.prototype.push.apply(subscriptions, query.topics)
      onSubscribed && onSubscribed(data, jwt)
    })
  }

  if (this.connected()) subscribe() 
  else this.listenToOnce(this, 'connected', subscribe)
}

SocketsWrapper.prototype.unsubscribe = function (options={}) {

  let { query, onUnsubscribed } = options

  let subscriptions = this.subscriptions

  if (this.connected()) {
    logger.debug('unsubscribing...')
    this.socket.post('/sockets/unsubscribe', query||{}, function (data, jwt) {
      subscriptions = []
      onUnsubscribed && onUnsubscribed(data, jwt)
    })
  } else {
    logger.debug('socket is not connected. cannot unsubscribe')
  }
}

SocketsWrapper.prototype.serverSubscriptions = function () {
  if (this.connected()) {
    logger.debug('querying subscriptions')
    this.socket.get('/sockets/subscriptions', function (data, jwt) {
      logger.debug('%o', data)
    })
  } else {
    logger.debug('socket is not connected. cannot unsubscribe')
  }
}

module.exports = SocketsWrapper
