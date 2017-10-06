'use strict'

import PageView from 'view/page/dashboard'
import App from 'ampersand-app'
import search from 'lib/query-params'
import Route from 'lib/router-route'
import after from 'lodash/after'

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

  App.state.dashboard.groupedResources.once('reset',() => {
    logger.log('resources synced and grouped resources prepared')
    App.state.dashboard.resourcesDataSynced = true
  })

  App.state.tasks.once('sync',() => {
    logger.log('tasks synced')
    App.state.dashboard.tasksDataSynced = true
  })

  App.state.loader.visible = true

  var resourcesToFetch = ['hosts', 'monitors']
  if (fetchTasks)
    resourcesToFetch.push('tasks')

  var done = after(resourcesToFetch.length, function(){
    App.state.loader.visible = false
  })

  App.state.hosts.fetch({
    success: () => {
      done()
    }
  })

  App.state.resources.fetch({
    success: () => {
      App.state.dashboard.groupResources()
      done()
    }
  })

  if (fetchTasks) {
    App.state.tasks.fetch({
      success: () => {
        done()
      }
    })
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
