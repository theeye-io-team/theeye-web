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
      "GCM": "{ \"data\": { \"message\": \"" + message + "\" } }"
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

const prepareHostNotification = (monitor) => {
  var msg = ''
  if (monitor.state == 'recovered' || (monitor.state == 'normal' && monitor.last_event.event == 'recovered')) {
    msg = `[HIGH] ${monitor.hostname}. ${monitor.name} recovered.`
  }

  if (monitor.state == 'updates_stopped') {
    msg = `[HIGH] ${monitor.hostname}. ${monitor.name} stopped reporting updates.`
  }

  return msg
}

const prepareDefaultNotification = (monitor) => {
  var msg = ''
  var severity = monitor.failure_severity || monitor.last_event.failure_severity
  if (severity == 'HIGH' || severity == 'CRITICAL') {
    if(monitor.state == 'recovered' || (monitor.state == 'normal' && monitor.last_event.event == 'recovered'))
      msg = `[HIGH] ${monitor.hostname}. ${monitor.name} recovered.`
    else {
      switch (monitor.state) {
        case 'updates_stopped':
          msg = `[HIGH] ${monitor.hostname}. ${monitor.name} stopped reporting updates.`
          break;
        case 'agent_stopped':
          msg = `[HIGH] ${monitor.hostname} host agent stopped reporting updates.`
          break;
        case 'agent:worker:error':
        case 'failure':
        default:
          msg = `[HIGH] ${monitor.hostname}. ${monitor.name} checks failed.`
      }
    }
  }

  return msg
}


module.exports = {
  send (event, users) {
    if (event.topic === 'monitor-state') {
      const model = event.data.model
      let msg = prepareMonitorStateChangeNotification(model)
      _send(msg, users)
    }
  }
}

const prepareMonitorStateChangeNotification = (monitor) => {
  let msg
  switch (monitor.type) {
    case 'file': break;
    case 'psaux': break;
    case 'dstat': break;
    case 'host':
      msg = prepareHostNotification(monitor)
      break
    case 'script':
    case 'process':
    case 'scraper':
      msg = prepareDefaultNotification(monitor)
      break
    default:
      debug('ERROR. type not defined or not handled')
      debug('%o',monitor)
      break
      
  }
  return msg
}
