import PageView from 'view/page/dashboard'
import App from 'ampersand-app'
import search from 'lib/query-params'
import Route from 'lib/router-route'


class Dashboard extends Route {
  indexRoute () {
    App.state.loader.visible = true

    const query = search.get()
    App.state.dashboard.setMonitorsGroupBy(query.monitorsgroupby)
    App.state.dashboard.setTasksGroupBy(query.tasksgroupby)

    App.actions.dashboard.fetchData()
    return new PageView({})
  }
}

export default Dashboard
