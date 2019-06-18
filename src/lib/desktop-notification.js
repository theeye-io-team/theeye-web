
export default {
  create (notification) {
    // no support? no action
    if (!('Notification' in window)) return
    // if user has denied access, don't bother anymore
    if (window.Notification.permission === 'denied') return

    const notifOptions = {
      icon: notification.icon,
      badge: notification.icon, // not happening
      body: notification.message
    }

    if (navigator.platform.toLowerCase().indexOf('mac') === -1) {
      notifOptions.tag = notification.tag
    }

    if (window.Notification.permission !== 'granted') {
      window.Notification.requestPermission(permission => {
        if (permission === 'granted') {
          createDesktopNotification(notification.title, notifOptions)
        }
      })
    } else {
      createDesktopNotification(notification.title, notifOptions)
    }
  }
}

const createDesktopNotification = (title, options) => {
  const notify = new window.Notification(title, options)
  notify.onclick = function () {
    // eslint-disable-next-line
    parent.focus()
    window.focus() // just in case, older browsers
    this.close()
  }
}
