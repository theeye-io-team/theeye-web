/* global sails */

var debug = require('debug')('eye:libs:push-notifications')
var AWS = require('aws-sdk')
var SNS = new AWS.SNS(new AWS.Config(sails.config.aws))

const _send = (message,users) => {
  if (!message) return debug('Error. invalid message, undefined condition')
  message = message.replace(/['"]+/g, '')

  var params = {
    MessageStructure: 'json',
    Message: JSON.stringify({
      "GCM": "{ \"data\": { \"message\": \"" + message + "\", \"style\": \"inbox\", \"summaryText\": \"%n% New notifications\"} }",
      "APNS_SANDBOX": "{ \"aps\": { \"alert\": \"" + message + "\" } }",
      "APNS": "{ \"aps\": { \"alert\": \"" + message + "\" } }"
    })
  }

  if (users.length) {
    users.forEach(function (user) {
      if (user.notifications && user.notifications['push'] !== true) {
        // user opt out
        return
      }
      if (user.devices) {
        user.devices.forEach(function (device) {
          params.TargetArn = device.endpoint_arn
          SNS.publish(params, function (error, data) {
            if (error) {
              debug(error)
            } else {
              debug('Push notification sent.')
            }
          })
        })
      }
    })
  }
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
      debug('ERROR. event not defined or not handled')
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
      debug('ERROR. event not defined or not handled')
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
      debug('ERROR. type not defined or not handled')
      debug('%o',monitor)
      break

  }
  return msg
}
