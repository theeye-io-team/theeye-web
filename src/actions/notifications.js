import App from 'ampersand-app'
import XHR from 'lib/xhr'
import config from 'config'
import { Model as Notification } from 'models/notification'
import DesktopNotification from 'lib/desktop-notification'

const logger = require('lib/logger')('actions:tasks')

module.exports = {
  /**
   *
   * @param {Boolean} removeAll remove all notifications
   *
   */
  removeAllRead (removeAll) {
    let query = ''
    if (removeAll===true) { query = '?remove_all=true' }

    // remove only read notifications by default
    XHR.send({
      url: `${config.app_url}/inbox${query}`,
      method: 'DELETE',
      headers: { Accept: 'application/json;charset=UTF-8' },
      done (response,xhr) {
        App.state.notifications.fetch({ reset: true })
      }
    })
  },
  markAllRead () {
    let notif = App.state.notifications
      .filter(n => !n.read)
      .map(n => { return { id: n.id } })

    if (notif.length === 0) return

    XHR.send({
      url: `${config.app_url}/inbox/markallread`,
      method: 'PATCH',
      headers: { Accept: 'application/json;charset=UTF-8' },
      jsonData: notif,
      done: function (response, xhr) {
        //App.state.notifications.fetch({ reset: true })
        App.state.notifications.fetch({ remove: false })
      }
    })
  },
  /**
   *
   * this method is called on socket event
   * only will arrive unread notifications
   *
   */
  handleNotification (data) {
    let notification = new Notification(data)
    if (App.state.inbox.isOpen) {
      notification.read = true
      notification.save()
    }
    App.state.notifications.add(notification)

    DesktopNotification.create(notification)
  },
  toggleInboxOpen () {
    App.state.inbox.toggle('isOpen')
  }
}
