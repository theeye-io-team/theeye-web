'use strict'

var debug = require('debug')('eye:libs:push-notifications')
var AWS = require('aws-sdk');
var SNS = new AWS.SNS( new AWS.Config( sails.config.aws ) );

function send(customerName, message) {
  message = message.replace(/['"]+/g, '')

  var params = {
    MessageStructure: 'json',
    Message: JSON.stringify({
      "GCM": "{ \"data\": { \"message\": \"" + message + "\" } }"
    })
  }

  User.find({
    username : { $ne: null },
    customers: customerName
  }, function(error, users) {
    if(error) return debug(error);
    if(users.length) (
      users.forEach(function(user) {
        if(user.devices) {
          user.devices.forEach(function(device) {
            params.TargetArn = device.endpoint_arn
            SNS.publish(params, function(error, data) {
              if(error) {
                debug(error)
              } else {
                debug('Push notification sent.')
              }
            })
          })
        }
      })
    )
  })
}

function sendHostNotification(message) {
  var msg = ''
  if(message.state == 'recovered' || (message.state == 'normal' && message.last_event.event == 'recovered'))
    msg = `[HIGH] ${message.hostname}. ${message.name} recovered.`

  if(message.state == 'updates_stopped')
    msg = `[HIGH] ${message.hostname}. ${message.name} stopped reporting updates.`

  send(message.customer_name, msg)
}

function sendDefaultNotification(message) {
  var msg = ''
  var severity = message.failure_severity || message.last_event.failure_severity
  if (severity == 'HIGH' || severity == 'CRITICAL') {
    if(message.state == 'recovered' || (message.state == 'normal' && message.last_event.event == 'recovered'))
      msg = `[HIGH] ${message.hostname}. ${message.name} recovered.`
    else {
      switch (message.state) {
        case 'updates_stopped':
          msg = `[HIGH] ${message.hostname}. ${message.name} stopped reporting updates.`
          break;
        case 'agent_stopped':
          msg = `[HIGH] ${message.hostname} host agent stopped reporting updates.`
          break;
        case 'agent:worker:error':
        case 'failure':
        default:
          msg = `[HIGH] ${message.hostname}. ${message.name} checks failed.`
      }
    }
  }

  send(message.customer_name, msg)
}


module.exports = {
  sendNotification(message) {
    switch (message.type) {
      case 'file':
      break;
      case 'psaux':
      break;
      case 'dstat':
      break;
      case 'host':
        sendHostNotification(message)
        break;
      default:
        sendDefaultNotification(message)
        break;
    }
  }
}
