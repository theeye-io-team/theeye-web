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

  // get a socket and wait connected event
  this.on('connected', () => {
    this.autosubscribe({})
  })

  return this
}

export default SocketsWrapper

SocketsWrapper.prototype = Object.assign({}, SocketsWrapper.prototype, {
  connect ({ access_token }) {
    if (!this.socket) {
      logger.log('connecting socket client')
      let url = this.config.url

      // Ensure URL has no trailing slash
      url = url ? url.replace(/(\/)$/, '') : undefined

      // Initiate a socket connection
      let socket = io(url, { query: { access_token } })

      bindEvents(socket, this, this.events)
      this.socket = socket
    } else {
      const socket = this.socket
      if (!socket.connected) {
        logger.log('reconnecting socket')
        socket.io.opts.query.access_token = access_token
        socket.connect()
      }
    }
  },

  disconnect (done) {
    const socket = this.socket
    //this.off() // shutdown all event listeners

    this.once('disconnected', done)

    if (!socket) {
      this.trigger('disconnected')
      return
    }
    if (!socket.connected) {
      this.trigger('disconnected')
      return
    }

    //this.unsubscribe({}, socket.disconnect)
    socket.disconnect()
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

  /**
   * 'connect' event is triggered when the socket establishes a connection
   *  successfully.
   */
  socket.on('connect', function () {
    emitter.trigger('connected')
  })

  socket.on('disconnect', function () {
    emitter.trigger('disconnected')
  })

  socket.on('reconnecting', () => {
    emitter.trigger('reconnecting')
  })

  socket.on('reconnect', () => {
    emitter.trigger('reconnect')
  })

  return
}

const _connect = (config) => {
}
