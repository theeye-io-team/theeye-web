import App from 'ampersand-app'
import * as LifecycleConstants from 'constants/lifecycle'
import XHR from 'lib/xhr'

export default {
  stats (id) {
    // window.location = '/hoststats/' + id
    App.navigate('/admin/hoststats/' + id)
  },
  applyStateUpdate (id, data) {
    let host = App.state.hosts.get(id)

    if (!host) {
      console.warn('host not found %s', id)
      return
    }

    host.set(data)
  },
  reconfigure (id) {
    const host = App.state.hosts.get(id)
    XHR.send({
      method: 'PUT',
      url: `${host.url()}/reconfigure`,
      done (response) {
        App.state.alerts.success('Configuration update in progress')
      },
      fail (err, xhr) {
        App.state.alerts.danger('Cannot fulfill your request now')
      }
    })
  }
}
