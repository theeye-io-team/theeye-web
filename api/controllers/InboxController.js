/* global Notification */
//const ObjectID = require('mongodb').ObjectID
const ObjectID = require('sails-mongo/node_modules/mongodb').ObjectID


module.exports = {
  index: function (req, res) {
    Notification
      .find({
        customer_name: req.user.current_customer,
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
        res.send(200, updated)
      })
  },
  unreadCount (req, res) {
    Notification.count({
      customer_name: req.user.current_customer,
      user_id: req.user.id,
      read: false
    }, (err, count) => {
      if (err) {
        res.send(400, err)
        return
      }
      res.send(200, count)
    })
  },
  remove (req, res) {
    const query = {
      customer_name: req.user.current_customer,
      user_id: req.user.id
    }

    if ( !(req.query.remove_all==='true') ) {
      query.read = true
    }

    Notification.native(function (err, notifications) {
      if (err) return res.send(500, err)

      notifications.remove(query, function (err, result) {
        if (err) return res.send(500, err)
        res.send(200, null)
      })
    })
  },
  markAllRead (req, res) {
    const notif = req.body

    let ids = notif.map(n => new ObjectID(n.id)) // native mongodb query uses ObjectID

    Notification.native(function (err, notifications) {
      if (err) return res.send(500, err)

      notifications.update(
        {
          _id: { $in: ids },
          user_id: req.user.id,
          customer_name: req.user.current_customer
        },
        { $set: { read: true } },
        { multi: true },
        function (err, result) {
          if (err) return res.send(500, err)

          res.send(200)
        }
      )
    })
  }
}
