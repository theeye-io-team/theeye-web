/* global sails */
'use strict'

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
  subscribe (req, res) {
    const socket = req.socket
    const user = req.user
    const customer = req.user.current_customer
    let topics = req.params.all().topics

    if (user.customers.indexOf(customer) === -1) {
      res.send(403, JSON.stringify({ message: 'forbiden' }))
    }

    if (!Array.isArray(topics)) {
      topics = []
    }

    // force notification-crud subscription
    socket.join(customer + ':' + req.user.id + ':notification-crud')
    sails.log.debug('client subscribed to', customer + ':' + req.user.id + ':notification-crud')

    for (let i = 0; i < topics.length; i++) {
      let room = customer + ':' + topics[i]
      socket.join(room)
      sails.log.debug(`client subscribed to ${room}`)
    }

    res.json({ message: 'subscription success' })
  },
  /**
   *
   * unsubscribe all
   *
   */
  unsubscribe (req, res) {
    const socket = req.socket
    const user = req.user
    const customer = req.user.current_customer
  }
}
