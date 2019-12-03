/* global sails */
const logger = require('../libs/logger')('controllers:sockets')

/**
 *
 * just subscribe a user to the customer currently session
 *
 */
module.exports = {
  _config: {
    shortcurts: false,
    rest: false
  },
  /**
   * subscribe
   */
  subscribe (req, res) {
    const socket = req.socket
    const user = req.user
    const customer = req.user.current_customer

    let topics = req.params.all().topics

    if (user.customers.indexOf(customer) === -1) {
      res.send(403, JSON.stringify({ message: 'forbiden' }))
    }

    const joinRoom = (room) => {
      socket.join(room)
      logger.debug('client subscribed to %s', room)
    }

    // forced subscriptions
    joinRoom(`${customer}:${req.user.id}:notification-crud`)
    joinRoom(`${customer}:${req.user.id}:job-result-render`)
    joinRoom(`${req.user.id}:session-customer-changed`)

    if (!Array.isArray(topics)) topics = []
    topics.forEach(topic => joinRoom(`${customer}:${topic}`))

    res.json({ message: 'subscription success' })
  },
  /**
   * unsubscribe
   */
  unsubscribe (req, res) {
    const socket = req.socket
    const user = req.user
    const customer = req.user.current_customer

    var logops = []

    let topics = req.params.all().topics

    if (!topics) { // unsubscribe all
      let myRooms = socket.manager.roomClients[socket.id]
      for (var roomName in myRooms) {
        if (myRooms[roomName]===true) {
          let trueName = roomName.substring(1)
          // remove leading / from roomName, dont know why it has a leading /
          socket.leave(trueName, function(){
            let msg = `client leave room ${trueName}`
            logops.push(msg)
            logger.debug(msg)
          })
        }
      }
    } else {
      topics.forEach(topic => {
        let roomName = `${customer}:${topic}`
        socket.leave(roomName, function(){
          let msg = `client leave room ${roomName}`
          logops.push(msg)
          logger.debug(msg)
        })
      })
    }

    res.send(200, logops)
  },
  /**
   * query subscriptions
   */
  subscriptions (req, res) {
    const socket = req.socket
    let myRooms = socket.manager.roomClients[socket.id]
    res.json(Object.keys(myRooms))
  }
}
