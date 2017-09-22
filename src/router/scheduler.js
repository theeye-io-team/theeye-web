import SchedulerPageView from 'view/scheduler'
import App from 'ampersand-app'
import Route from 'lib/router-route'

class Scheduler extends Route {
  indexRoute () {
    // schedules collection
    App.state.schedules.fetch()

    return new SchedulerPageView({
      collection: App.state.schedules
    })
  }
}

module.exports = Scheduler
