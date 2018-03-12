import search from 'lib/query-params'
import App from 'ampersand-app'
import after from 'lodash/after'

module.exports = {
  setMonitorsGroupByProperty (prop) {
    const query = search.get()
    query.monitorsgroupby = { prop: prop }
    const qs = search.set(query)

    App.Router.navigate(`dashboard?${qs}`, { replace: true })
    App.Router.reload()
  },
  loadNewRegisteredHostAgent (host) {
    var done = after(2, function () {
      App.state.dashboard.groupResources()
    })
    var step = function () {
      done()
    }
    App.state.resources.fetch({ success: step, error: step })
    App.state.hosts.fetch({ success: step, error: step })
  }
}
