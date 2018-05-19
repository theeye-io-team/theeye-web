import App from 'ampersand-app'

export default {
  applyStateUpdate (type, stats) {
    if ( /hoststats/.test(window.location.pathname) ) { // currently navigating host stats
      if (App.state.hoststatsPage.host.id == stats.host_id) {
        App.state.hoststatsPage[type] = stats
      }
    }
  }
}
