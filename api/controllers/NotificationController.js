const logger = require('../libs/logger')('controller:notifications')
const Notifications = require('../libs/notifications')
const moment = require('moment')

module.exports = {
  /*
   *
   * @method rename to create
   *
   */
  create (req, res) {
    const event = req.params.all()
    const done = (err) => {
      if (err) {
        logger.error(err.message)
        if (err.status === 400) {
          return res.send(400, err.error.toString())
        }
        return res.send(500, err.toString())
      } else {
        return res.send(200)
      }
    }

    if (!event.id) {
      let err = new Error('id required')
      err.status = 400
      return done(err)
    }

    if (!event.data) {
      let err = new Error('%s|data required', event.id)
      err.status = 400
      return done(err)
    }

    if (!event.topic) {
      let err = new Error('%s|topic required', event.id)
      err.status = 400
      return done(err)
    }

    logger.debug('%s|event arrived. %s, %s, %s',
      event.id,
      event.topic,
      event.data.operation,
      event.data.model_type
    )

    // dispatch original event to all clients
    Notifications.sockets.send(event)

    createEventNotifications(req, res, (err) => {
      if (err) { return done(err) }

      if (
        event.data.model_type === 'NotificationJob' &&
        event.data.operation === 'create'
      ) {
        if (!event.data.model.task) {
          let err = new Error('%s|task is required', event.id)
          err.status = 400
          return done(err)
        }

        createCustomNotification(req, res, done)
      } else {
        return done()
      }
    })
  },
  /**
   *
   * remove notifications to free database space
   *
   */
  maintenance (req, res) {
    Notification.native(function (err, notifications) {
      if (err) { return res.send(500, err) }

      let date = moment()
        .subtract(1, 'days')
        .startOf('day')
        .toDate()

      notifications.remove({
        createdAt: {
          $lte: date
        }
      }, function (err, result) {
        if (err) { return res.send(500, err) }
        res.send(200, { count: result })
      })
    })
  }
}

const createCustomNotification = (req, res, done) => {
  const event = req.params.all()

  const notifyJob = event.data.model
  const notifyTask = notifyJob.task
  const notificationTypes = notifyTask.notificationTypes

  const args = (notifyJob.task_arguments_values || [])

  let subject = (args[0] || notifyTask.subject)
  let body = (args[1] || notifyTask.body)
  let recipients = (parseRecipients(args[2]) || notifyTask.recipients)

  logger.debug('%s|%s', event.id, 'dispatching custom notifications')
  getUsersToNotify(null, event.data.organization, recipients, [], (error, users) => {
    if (error) {
      let msg = 'error getting system users'
      logger.debug('%s|%s', event.id, msg)
      return done(new Error(msg))
    }

    if (users.length === 0) {
      logger.debug('%s|%s', event.id, 'dismissed. no system users to notify')
      return done()
    }

    event.data.notification = { subject, body, recipients }

    //createNotifications(event, users, event.data.organization, (err, notifications) => {
    createNotifications({
      topic: 'notification-task',
      data: event.data,
      event_id: event.id,
      customer_name: event.data.organization
    }, users, (err, notifications) => {
      if (err) {
        let msg = `${event.id}|error creationg notifications`
        logger.debug(msg)
        return done(new Error(msg))
      }

      if (!notificationTypes || notificationTypes.desktop) {
        // send extra notification event via socket to desktop clients
        Notifications.sockets.send({
          id: event.id,
          topic: 'notification-crud',
          data: {
            model: notifications,
            model_type: 'Notification',
            operation: 'create',
            organization: event.data.organization
          }
        })
        logger.debug('%s|%s', event.id, 'by desktop notified')
      }

      // If notifications are not filtered, send all types as default
      if (!notificationTypes || notificationTypes.push) {
        Notifications.push.dispatch({ msg: subject }, users)
        logger.debug('%s|%s', event.id, 'by push notified')
      }

      if (!notificationTypes || notificationTypes.email) {
        Notifications.email.send({ subject, body }, users)
        logger.debug('%s|%s', event.id, 'by email notified')
      }

      // create custom socket connections and messages
      //if (notificationTypes.socket) {
      //  // notify user to connected sockets
      //  users.forEach((user) => {
      //    // TO ADD
      //    logger.debug('%s|%s', event.id, 'by desktop notified')
      //  }
      //})

      logger.debug('%s|%s', event.id, 'custome notifications dispatched')
      return done()
    })
  })
}

const parseRecipients = (emails) => {
  let recipients = null
  if (!emails) { return recipients }
  if (typeof emails === 'string') {
    try {
      let values = JSON.parse(emails)
      if (Array.isArray(values) && values.length > 0) {
        recipients = values
      } else {
        throw new Error('invalid recipients format')
      }
    } catch (e) {
      logger.error(e.message)
      recipients = [emails]
    }
  }
  return recipients
}

const createEventNotifications = (req, res, done) => {
  const event = req.params.all()
  const topic = event.topic

  logger.debug('%s|dispatching event notification.', event.id)

  if (!isHandledNotificationEvent(event)) {
    logger.debug('%s|dismissed. not handled', event.id)
    return done()
  }

  let model = event.data.model
  let acls = (model.task ? model.task.acl : model.acl) || []
  let credentials = ['admin', 'owner', 'root']

  getUsersToNotify(event, event.data.organization, acls, credentials, (error, users) => {
    if (error) {
      let msg = 'error getting system users'
      logger.debug('%s|%s', event.id, msg)
      return done(new Error(msg))
    }

    if (users.length === 0) {
      logger.debug('%s|%s', event.id, 'dismissed. no system users to notify')
      return done()
    }

    users = applyNotificationFilters(event, users)
    if (!users || !Array.isArray(users) || !users.length) {
      logger.debug('%s|%s', event.id, 'dismissed. notification is ignored by users')
      return done()
    }

    // create a notification for each user
    createNotifications({
      topic: event.topic,
      data: event.data,
      event_id: event.id,
      customer_name: event.data.organization
    }, users, (err, notifications) => {
      if (err) {
        let msg = 'error creating user notifications'
        logger.debug('%s|%s', event.id, msg)
        return done(new Error(msg))
      }

      // send extra notification event via socket to desktop clients
      Notifications.sockets.send({
        id: event.id,
        topic: 'notification-crud',
        data: {
          model: notifications,
          model_type: 'Notification',
          operation: 'create',
          organization: event.data.organization
        }
      })
      logger.debug('%s|%s', event.id, 'by socket notified')

      Notifications.push.send(event, users)
      logger.debug('%s|%s', event.id, 'by push notified')

      //Notifications.email.send('TO-DO', users)
      //logger.debug('%s|%s', event.id, 'by email notified')

      logger.debug('%s|%s', event.id, 'event notifications dispatched')
      return done()
    })
  })
}

const handledTopics = [
  'monitor-state',
  'job-crud'
]

const isHandledNotificationEvent = (event) => {
  if (handledTopics.indexOf(event.topic) === -1) {
    return false
  }

  if (
    event.topic == 'monitor-state' &&
    event.data.model.type !== 'host' &&
    (
      event.data.monitor_event == 'updates_stopped' ||
      event.data.monitor_event == 'updates_started'
    )
  ) {
    return false
  }

  return true
}

// Returns a user collection for a given customer
const getUsersToNotify = (event, customerName, acls, credentials, callback) => {
  if (!customerName) {
    const err = new Error('I need a customer to find the users')
    return callback(err)
  }

  var query = {}

  if (event && isApprovalOnHoldEvent(event)) {
    query = {
      id: { $in: event.data.approvers }
    }
  } else {
    query = {
      username: { $ne: null },
      customers: customerName,
      $or: [
        { credential: { $in: credentials } },
        { email: { $in: acls } }
      ]
    }
  }

  User.find(query, function (error, users) {
    if (!users || !Array.isArray(users) || users.length === 0) {
      return callback(null, [])
    }

    callback(error, users)
  })
}

// Persist notifications
const createNotifications = (event, users, callback) => {
  // rulez for updates stopped/updates started.
  // only create notification for host
  const notifications = []

  users.forEach(user => {
    notifications.push(Object.assign({}, event, { user_id: user.id }))
  })

  sails.models.notification.create(notifications).exec(callback)
}

/**
 *
 * @summary all filters within the same group should match to match the whole filter.
 * @prop {Object} filter an object with exclusion filter data
 * @prop {Object} event the notification event information (with data and topic)
 * @return true if any filter match
 *
 */
const hasMatchedExclusionFilter = (filter, event) => {
	// every string prop value has to match
  let matchedProps = []
  let matchedData = []
  let hasMatches

  // look for matches in props
  for (let prop in filter) {
    if (canCompare(filter[prop], event[prop])) {
      matchedProps.push(filter[prop] === event[prop])
    }
  }

  // if no matched every level 1 properties, then break
  if (matchedProps.length>0) {
    hasMatches = matchedProps.every(match => match === true)
    if (hasMatches===false) { return false }
  }

  // look for matches in data prop
  if (filter.hasOwnProperty('data')) {
    for (let prop in filter.data) {
      if (canCompare(filter.data[prop], event.data[prop])) {
        matchedData.push(filter.data[prop] === event.data[prop])
      }
    }
  }

  if (matchedData.length>0) {
    hasMatches = matchedData.every(match => match === true)
    if (hasMatches===false) { return false }
  }

  return true
}

/**
 * @summary can compare same valid comparable types
 * @param {*} val1
 * @param {*} val2
 * @return {Boolean}
 */
const canCompare = (val1, val2) => {
  const isComparable = (value) => {
    // we can compare types and null
    let types = ['number','string','boolean','undefined']
    let type = typeof value
    return types.indexOf(type) !== -1 || value === null
  }

  if (isComparable(val1) && isComparable(val2)) {
    return (typeof val1 === typeof val2)
  } else {
    return false
  }
}

/**
 * @summary ...
 * @param {Object} event
 * @return {Boolean}
 */
const isApprovalOnHoldEvent = (event) => {
  let isEvent = (
    event.topic === 'job-crud' &&
    event.data.model_type === 'ApprovalJob' &&
    event.data.model.lifecycle === 'onhold'
  )

  return isEvent
}

const applyNotificationFilters = (event, users) => {
  return users.filter(user => {
    let exclusionFilter
    let excludes = (user.notifications && user.notifications.notificationFilters) || []

    if (!isApprovalOnHoldEvent(event)) {
      if (excludes && Array.isArray(excludes) && excludes.length > 0) {
        exclusionFilter = excludes.find(exc => {
          return hasMatchedExclusionFilter(exc, event)
        })
      }
    }

    return (exclusionFilter === undefined)
  })
}
