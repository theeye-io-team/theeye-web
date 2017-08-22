'use strict'

/**
 *
 * just subscribe a user to its own customer , for the current session
 *
 */
module.exports = {
  _config: {
    shortcurts: false,
    rest: false
  },
  subscribe: function(req, res) {
    var socket = req.socket
    var user = req.user
    var customer = req.session.customer
    var topics = req.params.all().topics

    if (user.customers.indexOf( customer ) === -1) {
      res.send(403, JSON.stringify({ message: 'forbiden' }))
    }

    if (!Array.isArray(topics) || topics.length===0) {
      res.send(400, JSON.stringify({
        message: 'please provide some topics to subscribe'
      }))
    }

    for (let i =0; i<topics.length; i++) {
      let room = customer + ':' + topics[i]
      socket.join(room)
      sails.log.debug(`client subscribed to ${room}`)
    }

    res.json({ message: 'subscription success' })
  }
}
