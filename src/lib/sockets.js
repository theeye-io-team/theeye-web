/**
 *
 * Simple socket connector.
 * how to use
 *
 *  // connect sockets and start listening to events
 *  new SocketsWrapper({
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
import App from 'ampersand-app'
import Events from 'ampersand-events'
import assign from 'lodash/assign'
import sailsSockets from 'lib/sails.io.js'
const logger = require('lib/logger')('eye::sockets')

function SocketsWrapper (options) {
  // only instances can extended its own prototype
  if ( ! (this instanceof SocketsWrapper) ) {
    return new SocketsWrapper(options)
  }

  this.events = options.events

  assign(this, Events)
  return this
}

module.exports = SocketsWrapper

SocketsWrapper.prototype = Object.assign({}, SocketsWrapper.prototype, {

  connect (done) {
    const sailsIO = sailsSockets(io) // setup sails sockets connection using global socket.io object
    let socket = this.socket
    if (!socket) {
      logger.log('connecting sails socket')
      sailsIO.connect({ url: App.config.socket_url }, (err, socket) => {
        this.socket = socket
        bindEvents(socket, this, this.events)
        done(null, socket)
      })
    } else {
      if (!socket.socket.connected) {
        var host = new RegExp(socket.socket.options.host)
        if (host.test(App.config.socket_url)) {
          // If host url matches, reconnect socket.
          logger.log('reconnecting socket')
          socket.socket.connect()
          done(null, socket)
        } else {
          // If host url doesn't match, connect new socket.
          sailsIO.connect({ url: App.config.socket_url }, (err, socket) => {
            this.socket = socket
            bindEvents(socket, this, this.events)
            done(null, socket)
          })
        }
      }
    }
  },

  disconnect (done) {
    let socket = this.socket
    if (!socket) return
    if (socket.socket.connected) {
      this.unsubscribe({ // unsubscribe all
        onUnsubscribed: () => {
          socket.disconnect()
        }
      })
    }
  },

  destroy (done) {
  },

  connected () {
    let socket = this.socket
    return socket && socket.socket && socket.socket.connected
  },

  subscribe ({ query, onSubscribed }) {
    let socket = this.socket

    const subscribe = () => {
      logger.debug('subscribing...')
      socket.post('/sockets/subscribe', query, function (data, jwt) {
        onSubscribed && onSubscribed(data, jwt)
      })
    }

    if (this.connected()) { subscribe() }
    else this.listenToOnce(this, 'connected', subscribe)
  },

  unsubscribe (options={}) {
    let { query, onUnsubscribed } = options
    let socket = this.socket

    if (this.connected()) {
      logger.debug('unsubscribing...')
      socket.post('/sockets/unsubscribe', query||{}, function (data, jwt) {
        onUnsubscribed && onUnsubscribed(data, jwt)
      })
    } else {
      logger.debug('socket is not connected. cannot unsubscribe')
    }
  },

  serverSubscriptions () {
    let socket = this.socket
    if (this.connected()) {
      logger.debug('querying subscriptions')
      socket.get('/sockets/subscriptions', function (data, jwt) {
        logger.debug('%o', data)
      })
    } else {
      logger.debug('socket is not connected. cannot unsubscribe')
    }
  }
})

const bindEvents = (socket, emitter, events) => {
  for (let event in events) {
    socket.on(event, function (message) {
      events[event](message)
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
    emitter.trigger(arguments[0], arguments[1])
  }

  socket.on('connect', function () {
    emitter.trigger('connected')
  })

  socket.on('disconnect', function () {
    emitter.trigger('disconnected')
  })

  return
}
