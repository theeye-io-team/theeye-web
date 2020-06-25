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
 *      logger.debug('subscribed to event updates')
 *    },
 *    events: {
 *      'event-name': function eventHandler(data) {
 *      },
 *      'another-event': function ... (data) {
 *      }
 *    },
 *    config: {
 *      url: ''
 *    }
 *  })
 *
 */
import io from 'socket.io-client'
import App from 'ampersand-app'
import Events from 'ampersand-events'
import loggerModule from 'lib/logger'; const logger = loggerModule('eye::sockets')

function SocketsWrapper (options) {
  // only instances can extended its own prototype
  if ( ! (this instanceof SocketsWrapper) ) {
    return new SocketsWrapper(options)
  }

  this.events = options.events
  this.config = options.config

  Object.assign(this, Events)
  return this
}

export default SocketsWrapper

SocketsWrapper.prototype = Object.assign({}, SocketsWrapper.prototype, {
  connect (payload, done) {
    let socket = this.socket

    // get a socket and wait connected event
    this.once('connected', () => { this.autosubscribe({}) })

    if (!socket) {
      logger.log('connecting socket client')

      _connect()({
        url: this.config.url,
        access_token: payload.access_token
      }, (err, socket) => {
        this.socket = socket
        bindEvents(socket, this, this.events)
        done && done(null, socket)
      })
    } else {
      if (!socket.connected) { // probably a re-login
        logger.log('reconnecting socket')
        socket.io.opts.query.access_token = payload.access_token
        socket.connect()
        done && done(null, socket)
      }
    }
  },

  disconnect (done) {
    let socket = this.socket
    if (!socket) { return }
    if (socket.connected) {
      socket.once
      this.once('disconnected', done)
      this.unsubscribe({}, () => {
        socket.disconnect()
      })
    }
  },

  connected () {
    let socket = this.socket
    return socket && socket.connected
  },

  subscribe (query, done) {
    let socket = this.socket
    if (!this.connected()) {
      throw new Error('sockets disconnected')
    }

    socket.emit('post:subscribe', query, function (data, jwt) {
      logger.debug(data, jwt)
      done && done(data, jwt)
    })
  },

  autosubscribe (query = {}, done) {
    let socket = this.socket

    const subscribe = () => {
      logger.debug('subscribing...')
      socket.emit('post:autosubscribe', query, function (data, jwt) {
        logger.debug(data, jwt)
        done && done(data, jwt)
      })
    }

    if (this.connected()) {
      subscribe()
    } else {
      this.listenToOnce(this, 'connected', subscribe)
    }
  },

  unsubscribe (query = {}, done) {
    let socket = this.socket

    if (!this.connected()) {
      logger.debug('socket is not connected. cannot unsubscribe')
    }

    logger.debug('unsubscribing...')
    socket.emit('post:unsubscribe', query, function (data, jwt) {
      done && done(data, jwt)
    })
  },

  serverSubscriptions () {
    let socket = this.socket
    if (this.connected()) {
      logger.debug('querying subscriptions')
      socket.emit('get:subscriptions', {}, function (data, jwt) {
        logger.debug('%o', data)
      })
    } else {
      logger.debug('socket is not connected. cannot unsubscribe')
    }
  }
})

const bindEvents = (socket, emitter, events) => {
  for (let eventName in events) {
    socket.on(eventName, function () {
      logger.debug(`event name ${eventName} received. %o`, arguments)
      events[eventName].apply(socket, arguments)
    })
  }

  // extend
  const emit = socket.emit
  socket.emit = function () {
    logger.debug('emitting: %o', arguments)
    emit.apply(socket, arguments)
  }

  //const $emit = socket.$emit
  //socket.$emit = function () {
  //  logger.debug('event received: %s, %o', arguments[0], arguments)
  //  $emit.apply(socket, arguments)
  //  emitter.trigger(arguments[0], arguments[1])
  //}

  socket.on('connect', function () {
    emitter.trigger('connected')
  })

  socket.on('disconnect', function () {
    emitter.trigger('disconnected')
  })

  return
}

const _connect = () => {
  return (config, next) => {
    let { url, access_token } = config

    // Ensure URL has no trailing slash
    url = url ? url.replace(/(\/)$/, '') : undefined

    // Initiate a socket connection
    const socket = io(url, { query: { access_token } })

    /**
     * 'connect' event is triggered when the socket establishes a connection
     *  successfully.
     */
    socket.on('connect', () => {

      socket.on('reconnect', function(transport, numAttempts) {
        var numSecsOffline = socket.msSinceConnectionLost / 1000
        console.log(
          'socket reconnected successfully after being offline ' +
          'for ' + numSecsOffline + ' seconds.')
      })

      socket.on('connect_error', function (err) {
        console.error('Connection Error:', err)
      })

      socket.on('reconnecting', function(msSinceConnectionLost, numAttempts) {
        socket.msSinceConnectionLost = msSinceConnectionLost
        console.log(
          'socket is trying to reconnect...' +
          'attempt #' + numAttempts
        )
      })
    })

    if (next) { next(null, socket) } // use callback to ensure socket is defined
  }
}
