/* global sails, User */
const LIFECYCLE = require('../../src/constants/lifecycle')
const debug = require('debug')('eye:web:controller:notification')
const Notifications = require('../libs/notifications')

const handledTopics = [
  'monitor-state',
  'job-crud'
]

module.exports = {
  /*
   *
   * @method rename to create
   *
   */
  create (req, res) {
    var event = req.params.all()
    const data = event.data
    const topic = event.topic

    if (!data) return res.send(400, 'Data is required.')
    if (!topic) return res.send(400, 'Topic is required.')

    debug('topic %s , model_type %s , model.name %s', topic, data.model_type, data.model.name)

    // only selected topics which need:
    //   - persist to db
    //   - handle topics locally (push & mail)
    //   - broadcast to another webs
    if (handledTopics.indexOf(event.topic) > -1) {
      // get the users that should be notified
      // we get the users here, so each notification lib doesn't
      // have to do the users query/fetch all over again
      getUsers(data.organization, (error, users) => {
        if (error) return debug(error)

        // create a profile (web, mobile) notification
        createNotifications(event, users, data.organization, (err2, notifications) => {
          if (err2) {
            return debug(err2)
          }
          // send extra notification event via sns topic
          Notifications.sns.send({
            topic: 'notification-crud',
            data: {
              model: notifications,
              model_type: 'Notification',
              operation: 'create',
              organization: data.organization
            }
          })
        })

        // push and mail here !important
        Notifications.push.send(event, users)

        Notifications.email.send('TO-DO', users)
      })
    }

    // notify other webs (even self) to handle
    // socket notifications via SNS post to http
    // endpoint (EventsController.update)
    Notifications.sns.send(event)

    return res.send(200)
  }
}

// Returns a user collection for a given customer
const getUsers = (customerName, callback) => {
  if (!customerName) {
    return callback(new Error('Need customer to find users'))
  }
  User.find({
    username: { $ne: null },
    customers: customerName
  }, callback)
}

// Persist notifications
const createNotifications = (event, users, customerName, callback) => {
  if (!users || !Array.isArray(users) || !users.length) {
    return callback(null, [])
  }

  // skip ScriptJobs 'assigned' lifecycle
  if (
    event.data.model_type === 'ScriptJob' &&
    event.data.model.lifecycle === LIFECYCLE.ASSIGNED) {
    return callback(null, [])
  }

  const notifications = users.map(user => {
    return {
      topic: event.topic,
      data: event.data,
      event_id: event.id,
      user_id: user.id,
      customer_name: customerName
    }
  })

  sails.models.notification.create(notifications).exec(callback)
}
