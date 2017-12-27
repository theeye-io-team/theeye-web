export default {
  parse: function (notification) {
    if (!this[notification.type]) {
      console.log('No notification type parser:', notification.type)
      return this.default(notification)
    }
    return this[notification.type](notification)
  },
  host: function (notification) {
    var msg = `[HIGH] ${notification.hostname}`
    if (
      notification.state === 'recovered' ||
      (notification.state === 'normal' && notification.last_event.notification === 'recovered')
    ) {
      msg = `${msg}. ${notification.name} recovered.`
    }

    if (notification.state === 'updates_stopped') {
      msg = `${msg}. ${notification.name} stopped reporting updates.`
    }
    return msg
  },
  default: function (notification) {
    var msg = ''
    var severity = notification.failure_severity || notification.last_event.failure_severity
    if (severity === 'HIGH' || severity === 'CRITICAL') {
      if (notification.state === 'recovered' ||
        (notification.state === 'normal' && notification.last_event.notification === 'recovered')) {
        msg = `[HIGH] ${notification.hostname}. ${notification.name} recovered.`
      } else {
        switch (notification.state) {
          case 'updates_stopped':
            msg = `[HIGH] ${notification.hostname}. ${notification.name} stopped reporting updates.`
            break
          case 'agent_stopped':
            msg = `[HIGH] ${notification.hostname} host agent stopped reporting updates.`
            break
          case 'agent:worker:error':
          case 'failure':
          default:
            msg = `[HIGH] ${notification.hostname}. ${notification.name} checks failed.`
        }
      }
    }
    return msg
  }
}
