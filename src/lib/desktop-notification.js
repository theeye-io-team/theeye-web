
import App from 'ampersand-app'
import notificationBadge from 'assets/images/theeyeonly_medium.png'
import meaning from 'view/inbox/item/meaning'

export default {
  create (notification) {
    if (!App.state.session.user.notifications.desktop) return
    // no support? no action
    if (!('Notification' in window)) return
    // if user has denied access, don't bother anymore
    if (window.Notification.permission === 'denied') return

    // if notification is older than 5', discard
    // NOTE: this should never happens... just in case the socket service take longer than that in deliver
    if (((new Date() - notification.createdAt) / 1000 / 60) > 3) return

    // no desktop for read notifications.
    // this is another improbable case, only should arrive unreaded notifications via socket
    if (notification.read) return

    const type = notification.data.model._type

    const notifOptions = {
      icon: notificationBadge,
      badge: notificationBadge, // not happening
      body: messageFactory(notification.data)
    }

    if (navigator.platform.toLowerCase().indexOf('mac') === -1) {
      notifOptions.tag = 'TheEyeNotification'
    }

    const title = titleFactory(notification.data)

    if (window.Notification.permission !== 'granted') {
      window.Notification.requestPermission(permission => {
        if (permission === 'granted') {
          createDesktopNotification(title, notifOptions)
        }
      })
    } else {
      createDesktopNotification(title, notifOptions)
    }
  }
}

const createDesktopNotification = (title, options) => {
  const notification = new window.Notification(title, options)
  notification.onclick = function () {
    // eslint-disable-next-line
    parent.focus()
    window.focus() // just in case, older browsers
    this.close()
  }
}

/**
 *
 * @todo rework this. unify with Inbox notifications and Mobile Inbox notifications
 */
const titleFactory = (data) => {
  const type = data.model._type
  if (type === 'Resource') {
    return 'Resource ' + data.model.name
  } else if (/Job/.test(type) === true) {
    return 'Task ' + data.model.name
  } else if (type === 'Webhook') {
    return 'Webhook ' + data.model.name
  } else {
    return ''
  }
}

const messageFactory = (data) => {
  const type = data.model._type
  if (type === 'Resource') {
    let eventIndex = data.custom_event || data.monitor_event
    return meaning[eventIndex] || meaning[data.monitor_event]
  } else if (/Job/.test(type) === true) {
    let state = data.model.state.toLowerCase().replace(/ /g, '_')
    let lifecycle = data.model.lifecycle
    return meaning['lifecycle:' + lifecycle] || `${lifecycle}:${state}`
  } else if (type === 'Webhook') {
    return meaning['webhook']
  } else {
    return data.model.state.toLowerCase().replace(/ /g, '_')
  }
}
