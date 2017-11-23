var debug = require('debug')('eye:web:controller:notification')
var pushNotifications = require('../libs/push-notifications')

var NotificationController = module.exports = {
  sendnotification: function(req, res) {
    var params = req.params.all()
    const data = params.data
    const topic = params.topic

    if (!data) return res.send(400, 'Data is missing.')

    if (topic==='events') {
      pushNotifications.sendNotification(data)
    }

    return res.send(200)
  }
}
