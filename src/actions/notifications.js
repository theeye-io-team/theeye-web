import App from 'ampersand-app'
import XHR from 'lib/xhr'
import { Model as Notification } from 'models/notification'
import DesktopNotification from 'lib/desktop-notification'
import notificationIcon from 'assets/images/theeyeonly_medium.png'
//import messageFactory from 'models/notification/messageFactory'
//import titleFactory from 'models/notification/titleFactory'
import * as LifecycleConstants from 'constants/lifecycle'
import * as NotificationConstants from 'constants/notifications'
import * as StateConstants from 'constants/states'

import loggerModule from 'lib/logger'
const logger = loggerModule('actions:tasks')

export default {
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
      url: `${App.config.api_url}/inbox${query}`,
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
      url: `${App.config.api_url}/inbox/markallread`,
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

    if (App.state.session.user.notifications.desktop === true) {
      // older than 5'
      if (((new Date() - notification.creation_date) / 1000 / 60) > 3) {
        return
      }

      // is unread
      if (notification.read) { return }

      DesktopNotification.create({
        //message: messageFactory(notification),
        //title: titleFactory(notification),
        message: notification.message,
        title: notification.title,
        icon: notificationIcon,
        tag: 'TheEyeNotification'
      })
    }
  },
  handleResultNotification (job) {
    /**
     *
     * job.output is an array of arguments
     *
     */
    let output = job.output.map(arg => {
      try {
        return JSON.parse(arg)
      } catch (e) {
        logger.error(e.message)
        return arg
      }
    })

    let popup = output.find(out => out.popup_component)
    if (popup) {
      App.actions.popup.show(popup.popup_component, `Message from ${job.name}`)
    }
  },
  toggleInboxOpen () {
    App.state.inbox.toggle('isOpen')
  }
}
