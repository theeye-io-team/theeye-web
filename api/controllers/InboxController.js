/* global Notification */

module.exports = {
  index: function (req, res) {
    Notification
      .find({
        user_id: req.user.id,
        limit: 40,
        sort: {createdAt: -1}
      })
      .exec((err, records) => {
        if (err) {
          return res.send(400, err)
        }
        return res.send(200, records)
      })
  },
  update: function (req, res) {
    const notification = req.body
    Notification
      .update(notification.id, notification)
      .exec((err, updated) => {
        if (err) {
          res.send(400, err)
          return
        }
        res.send(200)
      })
  },
  unreadCount: function (req, res) {
    Notification.count({
      user_id: req.user.id,
      notified: true,
      read: false
    }, (err, count) => {
      if (err) {
        res.send(400, err)
        return
      }
      res.send(200, count)
    })
  }
}
