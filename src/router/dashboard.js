'use strict'

import PageView from 'view/page/dashboard'
import App from 'ampersand-app'
import search from 'lib/query-params'
import Route from 'lib/router-route'

const logger = require('lib/logger')('router:dashboard')

class Dashboard extends Route {
  indexRoute () {
    const query = search.get()
    setStateFromQueryString(query)
    return index(query)
  }
}

module.exports = Dashboard

const setStateFromQueryString = (query) => {
  let groupBy = query.monitorsgroupby
  if (groupBy) {
    App.state.dashboard.setMonitorsGroupBy(groupBy)
  }
}

const fetchData = (options) => {
  const { fetchTasks } = options

  App.state.hosts.fetch()

  App.state.dashboard.groupedResources.once('reset',() => {
    logger.log('resources synced and grouped resources prepared')
    App.state.dashboard.resourcesDataSynced = true
  })

  App.state.tasks.once('sync',() => {
    logger.log('tasks synced')
    App.state.dashboard.tasksDataSynced = true
  })

  if (!fetchTasks) {
    // fetch only monitors
    App.state.resources.fetch({
      success: () => App.state.dashboard.groupResources()
    })
  } else {
    // fetch monitors and start page.
    App.state.resources.fetch({
      success: () => App.state.dashboard.groupResources()
    })
    App.state.tasks.fetch({ })
  }
}

const index = (query) => {
  const credential = App.state.session.user.credential
  const tasksEnabled = Boolean(query.tasks != 'hide' && credential != 'viewer')
  const statsEnabled = Boolean(query.stats == 'show')

  fetchData({ fetchTasks: tasksEnabled })

  return renderPageView({
    renderTasks: tasksEnabled,
    renderStats: statsEnabled
  })
}

/**
 * @param {Object} options
 * @property {Mixed[]} options.renderStats
 * @property {Mixed[]} options.renderTasks
 * @return {AmpersandView} page view
 */
const renderPageView = (options) => {
  return new PageView({
    groupedResources: App.state.dashboard.groupedResources,
    monitors: App.state.resources,
    tasks: App.state.tasks,
    renderTasks: options.renderTasks,
    renderStats: options.renderStats
  })
}
