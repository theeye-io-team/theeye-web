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

  App.state.dashboard.tasksDataSynced = false
  App.state.tasks.once('sync', () => {
    logger.log('tasks synced')
    App.state.dashboard.tasksDataSynced = true
  })

  App.state.listenToAndRun(App.state.dashboard, 'change:indicatorsDataSynced change:resourcesDataSynced change:tasksDataSynced', () => {
    if (App.state.dashboard.indicatorsDataSynced && App.state.dashboard.resourcesDataSynced && App.state.dashboard.tasksDataSynced) {
      App.state.dashboard.dataSynced = true
    }
  })

  App.actions.dashboard.fetchData(options)
}

const index = (query) => {
  // const credential = App.state.session.user.credential
  prepareData()
  return renderPageView()
}

/**
 * @param {Object} options
 * @return {AmpersandView} page view
 */
const renderPageView = (options) => {
  return new PageView({
    groupedResources: App.state.dashboard.groupedResources,
    indicators: App.state.indicators,
    monitors: App.state.resources,
    tasks: App.state.dashboard.groupedTasks,
    notifications: App.state.inbox.filteredNotifications
  })
}
