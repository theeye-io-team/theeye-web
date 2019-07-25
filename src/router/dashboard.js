'use strict'

import PageView from 'view/page/dashboard'
import App from 'ampersand-app'
import search from 'lib/query-params'
import Route from 'lib/router-route'

const logger = require('lib/logger')('router:dashboard')

class Dashboard extends Route {
  indexRoute () {
    App.state.loader.visible = true
    const query = search.get()
    App.state.dashboard.setMonitorsGroupBy(query.monitorsgroupby)
    App.state.dashboard.setTasksGroupBy(query.tasksgroupby)
    return index(query)
  }
}

module.exports = Dashboard

const prepareData = (options) => {
  const { fetchTasks } = options

  App.state.dashboard.indicatorsDataSynced = false
  App.state.indicators.once('sync', () => {
    logger.log('indicators synced')
    App.state.dashboard.indicatorsDataSynced = true
  })

  App.state.dashboard.resourcesDataSynced = false
  App.state.dashboard.groupedResources.once('reset', () => {
    logger.log('resources synced and grouped resources prepared')
    App.state.dashboard.resourcesDataSynced = true
  })

  if (fetchTasks) {
    App.state.dashboard.tasksDataSynced = false
    App.state.tasks.once('sync',() => {
      logger.log('tasks synced')
      App.state.dashboard.tasksDataSynced = true
    })
  }

  App.actions.dashboard.fetchData(options)
}

const index = (query) => {
  // const credential = App.state.session.user.credential
  const tasksEnabled = Boolean(query.tasks != 'hide')
  const statsEnabled = Boolean(query.stats == 'show')

  prepareData({ fetchTasks: tasksEnabled })

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
    indicators: App.state.indicators,
    monitors: App.state.resources,
    tasks: App.state.dashboard.groupedTasks,
    renderTasks: options.renderTasks,
    renderStats: options.renderStats
  })
}
