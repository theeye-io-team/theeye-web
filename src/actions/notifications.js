import App from 'ampersand-app'
import XHR from 'lib/xhr'
import config from 'config'
import { Model as Notification } from 'models/notification'

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
  add (model) {
    let notify = new Notification(model)
    if (App.state.inbox.isOpen) {
      notify.read = true
      notify.save()
    }
    App.state.notifications.add(notify)
  },
  toggleInboxOpen () {
    App.state.inbox.toggle('isOpen')
  }
}
