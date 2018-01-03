import App from 'ampersand-app'

export default {
  update (type, stats) {
    if (App.state.hoststatsPage.host.id == stats.host_id) {
      App.state.hoststatsPage[type] = stats
    }
  }
}
