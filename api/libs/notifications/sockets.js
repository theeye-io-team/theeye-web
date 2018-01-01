var debug = require('debug')('eye:libs:notifications:sockets')

module.exports = {
  emit (topic, message, next) {
    const data = message.data

    if (topic === 'notification-crud') {
      if (Array.isArray(data.model)) {
        // send a socket event for each user notification
        for (let idx in data.model) {
          let notification = data.model[idx]
          const room = `${notification.data.organization}:${notification.user_id}:${topic}`
          debug(`sending message to ${room}`)

          sails.io.sockets.in(room).emit(topic, {
            model: notification,
            model_type: 'Notification',
            operation: 'create',
            organization: notification.data.organization
          })
        }
        return next()
      } else {
        let msg = `ERROR: invalid notification structure. Array expected, received ${message.data.model}`
        return next( new Error(msg) )
      }
    } else {
      const room = `${data.organization}:${topic}`
      debug(`sending message to ${room}`)
      sails.io.sockets.in(room).emit(topic, data)
      next()
    }
  }
}
