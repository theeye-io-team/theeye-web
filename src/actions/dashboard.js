import search from 'lib/query-params'
import App from 'ampersand-app'
import after from 'lodash/after'
import NavbarActions from 'actions/navbar'

module.exports = {
  setMonitorsGroupByProperty (prop) {
    const query = search.get()
    query.monitorsgroupby = { prop: prop }
    const qs = search.set(query)

    App.Router.navigate(`dashboard?${qs}`, { replace: true })
    App.Router.reload()
  },
  loadNewRegisteredHostAgent (host) {
    App.state.loader.visible = false
    NavbarActions.hideSettingsMenu()
    const resourcesWasEmpty = Boolean(App.state.resources.length === 0)
    const step = after(2, function () {
      if (resourcesWasEmpty) {
        App.state.onboarding.trigger('first-host-registered')
      }
      //App.state.dashboard.groupResources()
    })

    App.state.resources.fetch({ success: step, error: step })
    App.state.hosts.fetch({ success: step, error: step })
  }
}
