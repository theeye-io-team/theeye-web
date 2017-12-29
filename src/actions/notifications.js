import App from 'ampersand-app'
import XHR from 'lib/xhr'
import config from 'config'

const logger = require('lib/logger')('actions:tasks')

module.exports = {
  removeAllRead () {
    XHR.send({
      url: `${config.app_url}/inbox/removeallread`,
      method: 'DELETE',
      headers: { Accept: 'application/json;charset=UTF-8' },
      done (response,xhr) {
        App.state.notifications.fetch({ reset: true })
      },
      error (response,xhr) {
      },
    })
  },
  markAllRead () {
    let notif = App.state.notifications
      .filter(n => !n.read)
      .map(n => { return { id: n.id } })

    if (notif.length===0) return

    XHR.send({
      url: `${config.app_url}/inbox/markallread`,
      method: 'PATCH',
      headers: { Accept: 'application/json;charset=UTF-8' },
      jsonData: notif,
      done (response,xhr) {
        App.state.notifications.fetch({ reset: true })
      },
      error (response,xhr) {
      },
    })
  }
}
