import SchedulerPageView from 'view/scheduler'
import App from 'ampersand-app'

function Route () {
}

Route.prototype = {
  route () {
    var page = this.index()

    App.currentPage = page
  },
  index () {
    // schedules collection
    App.state.schedules.fetch()

    const selector = '#schedulePageContainer'
    const container = document.querySelector(selector)

    return new SchedulerPageView({
      el: container,
      collection: App.state.schedules
    })
  }
}

module.exports = Route
