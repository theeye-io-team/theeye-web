import search from 'lib/query-params'
import App from 'ampersand-app'

module.exports = {
  setMonitorsGroupByProperty (prop) {
    const query = search.get()
    query.monitorsgroupby = { prop: prop }
    const qs = search.set(query)

    App.Router.navigate(`dashboard?${qs}`, { replace: true })
    App.Router.reload()
  }
}
