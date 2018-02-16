/* global sails */

var logger = require('../logger')('eye:libs:push-notifications')
var AWS = require('aws-sdk')
var SNS = new AWS.SNS(new AWS.Config(sails.config.aws))

const _send = (message,users) => {
  if (!message) return logger.error('Error. invalid message, undefined condition')
  message = message.replace(/['"]+/g, '')

  var params = {
    MessageStructure: 'json',
    Message: JSON.stringify({
      "GCM": "{ \"data\": { \"message\": \"" + message + "\", \"style\": \"inbox\", \"summaryText\": \"%n% New notifications\"} }",
      "APNS_SANDBOX": "{ \"aps\": { \"alert\": \"" + message + "\" } }",
      "APNS": "{ \"aps\": { \"alert\": \"" + message + "\" } }"
    })
  }

  logger.debug('Sending push notification to users with message: ' + message)

  if (users.length) {
    users.forEach(function (user) {
      if (user.notifications && user.notifications['push'] !== true) {
        // user opt out
        return
      }
      if (user.devices) {
        user.devices.forEach(function (device) {
          params.TargetArn = device.endpoint_arn
          logger.debug('Sending notification to target arn: ' + params.TargetArn)

          SNS.publish(params, function (error, data) {
            if (error) {
              logger.error('%o',error)
              logger.error('Error sending notification, deleting endpoint arn: ' + params.TargetArn)
              errorHandler(user, device)
            } else {
              logger.debug('Push notification sent.')
            }
          })
        })
      }
    })
  }
}

const errorHandler = (user, device) => {
  SNS.deleteEndpoint({
    EndpointArn: device.endpoint_arn
  }, function(error, data) {
    if (error) {
      logger.error('Error deleting previous Endpoint Arn')
      logger.error('%o',error);
      return
    }

    //remove user device on db
    user.devices = user.devices || []
    var index = user.devices.findIndex(elem => elem.uuid == device.uuid)
    if (index > -1) {
      user.devices.splice(index, 1)
    }
    User.update({id: user.id}, {devices: user.devices}).exec((error,user) => {
      if (error) {
        logger.error('Error creating new Endpoint Arn')
        logger.error('%o',error);
        return
      }
      logger.debug('Successfully removed Endpoint Arn.')
    })
  })
}

const prepareHostNotification = (monitor, monitor_event) => {
  var msg = ''

  switch (monitor_event) {
    case 'updates_started':
      msg = `${monitor.name} started reporting again.`
      break
    case 'updates_stopped':
      msg = `${monitor.name} stopped reporting updates.`
      break
    default:
      logger.error('ERROR. event not defined or not handled')
      break
  }

  return msg
}

const prepareDefaultNotification = (monitor, monitor_event) => {
  var msg = ''

  switch (monitor_event) {
    case 'recovered':
      msg = `${monitor.name} recovered.`
      break
    case 'failure':
      msg = `${monitor.name} checks failed.`
      break
    default:
      logger.error('ERROR. event not defined or not handled')
      break
  }

  return msg
}


module.exports = {
  send (event, users) {
    if (event.topic === 'monitor-state') {
      const model = event.data.model
      let monitor_event = event.data.monitor_event
      let severity = model.failure_severity || model.last_event.failure_severity

      if (severity == 'HIGH' || severity == 'CRITICAL') {
        let msg = prepareMonitorStateChangeNotification(model, monitor_event)
        if (msg) _send(msg, users)
      }
    }
  }
}

const prepareMonitorStateChangeNotification = (monitor, monitor_event) => {
  let msg
  switch (monitor.type) {
    case 'host':
      msg = prepareHostNotification(monitor, monitor_event)
      break
    case 'script':
    case 'process':
    case 'scraper':
      msg = prepareDefaultNotification(monitor, monitor_event)
      break
    default:
      logger.error('ERROR. type not defined or not handled')
      logger.error('%o',monitor)
      break

  }
  return msg
}
