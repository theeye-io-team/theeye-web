const logger = require('../libs/logger')('controllers:notification')
const Notifications = require('../libs/notifications')

const handledTopics = [
  'monitor-state',
  'job-crud',
  'webhook-triggered'
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

    logger.debug('topic %s model_type %s model.name %s',
      topic,
      data.model_type,
      data.model.name || 'no name property'
    )

    if (handledTopics.indexOf(event.topic) > -1) {
      var acls = (data.model.task ? data.model.task.acl : data.model.acl) || []

      getUsers(event, data.organization, acls, (error, users) => {
        if (error) return logger.error('%o', error)

        // create a notification for each user
        createNotifications(event, users, data.organization, (err, notifications) => {
          if (err) return logger.error('%o', err)
          if (notifications.length === 0) return

          // send extra notification event via sns topic
          Notifications.sockets.send({
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

        // Notifications.email.send('TO-DO', users)
      })
    }

    // notify other webs (even self) to handle
    // socket notifications via SNS post to http
    // endpoint (EventsController.update)
    Notifications.sockets.send(event)

    return res.send(200)
  }
}

// Returns a user collection for a given customer
const getUsers = (event, customerName, acls, callback) => {
  if (!customerName) {
    const err = new Error('I need a customer to find the users')
    return callback(err)
  }

  var query = {
    username: { $ne: null },
    customers: customerName,
    $or: [
      { credential: { $in: ['admin', 'owner', 'root'] } },
      { email: { $in: acls } }
    ]
  }

  if (isApprovalOnHoldEvent(event)) {
    query = {
      id: event.data.approver_id
    }
  }

  User.find(query, function (error, users) {
    if (!users || !Array.isArray(users) || !users.length) {
      return callback(null, [])
    }

    callback(error, users)
  })
}

// Persist notifications
const createNotifications = (event, users, customerName, callback) => {
  if (!users || !Array.isArray(users) || !users.length) {
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

  const notifications = []
  users.forEach(user => {
    let excludes = (user.notifications && user.notifications.desktopExcludes) || []
    let isExcluded = false

    if (!isApprovalOnHoldEvent(event)) {
      if (excludes && Array.isArray(excludes) && excludes.length > 0) {
        isExcluded = excludes.find(exc => {
          return matchExclusionFilter(exc, event)
        })
      }
    }

    if (!isExcluded) {
      notifications.push({
        topic: event.topic,
        data: event.data,
        event_id: event.id,
        user_id: user.id,
        customer_name: customerName
      })
    }
  })

  sails.models.notification.create(notifications).exec(callback)
}

/**
 *
 * @prop {Object} excFilter an object with exclusion filter data
 * @prop {Object} notifEvent the notification event information (with data and topic)
 * @return true if any filter match
 *
 */
const matchExclusionFilter = (excFilter, notifEvent) => {
	// every string prop value has to match
  let hasMatch = false
  for (let prop in excFilter) {
    if (canCompare(excFilter[prop]) && canCompare(notifEvent[prop])) {
      hasMatch = (excFilter[prop] === notifEvent[prop])
    }
  }

	// also we care about data properties
  let hasMatchingData = false
  if (excFilter.data) {
    for (let dataProp in excFilter.data) {
      if (canCompare(excFilter.data[dataProp]) && canCompare(notifEvent.data[dataProp])) {
        hasMatchingData = (notifEvent.data[dataProp] === excFilter.data[dataProp])
      }
    }
  } else {
    hasMatchingData = true
  }

	// filters are exclusions, if matches, reject returning false
  return hasMatch && hasMatchingData
}

/**
 * @summary ...
 * @param {*} value
 * @return {Boolean}
 */
const canCompare = (value) => {
  // we can compare types and null
  let types = ['number', 'string', 'boolean', 'undefined']
  let type = typeof value
  return types.indexOf(type) !== -1 || value === null
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
