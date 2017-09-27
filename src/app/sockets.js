'use strict'

import App from 'ampersand-app'
import SocketsWrapper from 'lib/sockets'
import ResourceAction from 'actions/resource'
import JobAction from 'actions/job'
import config from 'config'
const logger = require('lib/logger')('app:sockets')

const connect = (next) => {
  // first time connect is called it is autoconnected
  if (!io.socket) {
    logger.log('connecting sails socket')
    io.sails.connect(next)
  } else {
    if (!io.socket.socket.connected) {
      logger.log('reconnecting socket')
      io.socket.socket.connect()
      next(null,io.socket)
    }
  }
}

const disconnect = () => {
  if (!io.socket) return
  if (io.socket.socket.connected) {
    io.socket.disconnect()
  }
}

module.exports = () => {
  // initialize io.sails sockets
  io.sails = {
    autoConnect: false,
    useCORSRouteToGetCookie: true,
    environment: config.env,
    url: config.socket_url
  }
  SailsIOClient() // setup sails sockets connection

  App.listenToAndRun(App.state.session,'change:logged_in',() => {
    const logged_in = App.state.session.logged_in
    if (logged_in===undefined) return
    if (logged_in===true) {
      connect((err,socket) => {
        if (!App.sockets) { // create wrapper to subscribe and start listening to events
          App.sockets = new SocketsWrapper({
            io: io,
            channel: '/sockets/subscribe',
            query: {
              customer: App.state.session.customer.name,
              topics: ['resources','jobs']
            },
            onSubscribed (data,jwr) {
              if (jwr.statusCode === 200) {
                logger.log('subscribed to resources notifications')
              } else {
                logger.error('error subscribing to resources notifications')
                logger.error(jwr);
              }
            },
            events: {
              'resource:update': ResourceAction.update,
              'job:update': JobAction.update,
            }
          })
        }
      }) // create socket and connect to server
    } else disconnect()
  })
}
