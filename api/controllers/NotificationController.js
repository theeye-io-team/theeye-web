const logger = require('../libs/logger')('controllers:notification')
const Notifications = require('../libs/notifications')
const moment = require('moment')

const handledNotificationTopics = [
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
    let event = req.params.all()
    let done = (err) => {
      if (err) {
        if (err.status === 400) {
          return res.send(400, err.error.toString())
        }
        return res.send(500, err.toString())
      } else {
        return res.send(200)
      }
    }

    if (event.topic === 'notification-task') {
      createFromNotificationTask(req, res, done)
    } else {
      createFromNotificationEvent(req, res, done)
    }
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
        .subtract(3, 'days')
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

const createFromNotificationTask = (req, res, done) => {
  let params = req.params.all()
  const data = params.data

  if (!data) {
    let err = new Error('Data is required')
    err.status = 400
    return done(err)
  }

  if (!data.model.task) {
    let err = new Error('Task is required')
    err.status = 400
    return done(err)
  }

  let notificationTypes = data.notificationTypes
  let subject = data.model.task.subject
  let body = data.model.task.body
  let recipients = data.model.task.recipients

  getUsers(null, data.organization, recipients, [], (error, users) => {
    if (error) return done(new Error('Cant get users'))
    if (!users.length) {
      done()
    }

    // users.forEach((user) => {
    //   if (notificationTypes.socket) {
    //     // TO ADD
    //   }
    // })

    // If notifications are not filtered, send all types as default
    if (!notificationTypes || notificationTypes.push) {
      Notifications.push.dispatch({msg: subject}, users)
    }

    if (!notificationTypes || notificationTypes.email) {
      Notifications.email.send({subject, body}, users)
    }

    if (!notificationTypes || notificationTypes.desktop) {
      createNotifications(params, users, data.organization, (err, notifications) => {
        if (err) return done(new Error('Error creating notification'))
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
    }

    done()
  })
}

const createFromNotificationEvent = (req, res, done) => {
  var event = req.params.all()
  const data = event.data
  const topic = event.topic

  if (!data) {
    let err = new Error('Data is required')
    err.status = 400
    return done(err)
  }
  if (!topic) {
    let err = new Error('Topic is required')
    err.status = 400
    return done(err)
  }

  logger.debug('topic %s model_type %s model.name %s',
    topic,
    data.model_type,
    data.model.name || 'no name property'
  )

  if (handledNotificationTopics.indexOf(event.topic) > -1) {
    var acls = (data.model.task ? data.model.task.acl : data.model.acl) || []
    var credentials = ['admin', 'owner', 'root']

    getUsers(event, data.organization, acls, credentials, (error, users) => {
      if (error) return done(new Error('Cant get users'))

      users = applyNotificationFilters(event, users)

      // create a notification for each user
      createNotifications(event, users, data.organization, (err, notifications) => {
        if (err) return done(new Error('Error creating notification'))
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

  return done()
}

// Returns a user collection for a given customer
const getUsers = (event, customerName, acls, credentials, callback) => {
  if (!customerName) {
    const err = new Error('I need a customer to find the users')
    return callback(err)
  }

  var query = {}

  if (event && isApprovalOnHoldEvent(event)) {
    query = {
      id: event.data.approver_id
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
    notifications.push({
      topic: event.topic,
      data: event.data,
      event_id: event.id,
      user_id: user.id,
      customer_name: customerName
    })
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
