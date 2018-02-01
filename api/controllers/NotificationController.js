var AclService = require('../services/acl')

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

    debug('topic %s , model_type %s , model.name %s', topic, data.model_type, data.model.name||'no name property')

    // only selected topics which need:
    //   - persist to db
    //   - handle topics locally (push & mail)
    //   - broadcast to another webs
    if (handledTopics.indexOf(event.topic) > -1) {
      var acl = data.model.task ? data.model.task.acl : data.model.acl
      // get the users that should be notified
      // we get the users here, so each notification lib doesn't
      // have to do the users query/fetch all over again
      getUsers(data.organization, acl, (error, users) => {
        if (error) return debug(error)
        // create a profile (web, mobile) notification
        createNotifications(event, users, data.organization, (err, notifications) => {
          if (err) return debug(err)
          if (notifications.length===0) return

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

        //Notifications.email.send('TO-DO', users)
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
const getUsers = (customerName, acl, callback) => {
  if (!customerName) {
    const err = new Error('I need a customer to find the users')
    return callback(err)
  }

  User.find({
    username: { $ne: null },
    customers: customerName
  }, function(error, users) {
    if(users && users.length) {
      users = users.filter(user => AclService.isAdmin(user) || acl.includes(user.email))
    }
    callback(error, users)
  })
}

// Persist notifications
const createNotifications = (event, users, customerName, callback) => {
  if (!users || !Array.isArray(users) || !users.length) {
    return callback(null, [])
  }

  // skip ScriptJobs 'assigned' lifecycle
  if (
    (
      event.data.model_type === 'ScriptJob' ||
      event.data.model_type === 'ScraperJob'
    ) &&
    event.data.model.lifecycle === LIFECYCLE.ASSIGNED
  ) {
    return callback(null, [])
  }

  // rulez for updates stopped/updates started.
  // only create notification for host
  if (
    event.topic == 'monitor-state' &&
    (
      event.data.monitor_event == 'updates_stopped' ||
      event.data.monitor_event == 'updates_started'
    ) &&
    event.data.model.type !== 'host'
  ) {
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
