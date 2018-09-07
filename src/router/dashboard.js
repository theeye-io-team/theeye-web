'use strict'

import PageView from 'view/page/dashboard'
import App from 'ampersand-app'
import search from 'lib/query-params'
import Route from 'lib/router-route'
import after from 'lodash/after'
import WorkflowActions from 'actions/workflow'
import ApprovalActions from 'actions/approval'

const logger = require('lib/logger')('router:dashboard')

class Dashboard extends Route {
  indexRoute () {
    App.state.loader.visible = true
    const query = search.get()
    App.state.dashboard.setMonitorsGroupBy(query.monitorsgroupby)
    return index(query)
  }
}

module.exports = Dashboard

const prepareData = (options) => {
  const { fetchTasks } = options

  App.state.dashboard.resourcesDataSynced = false
  App.state.dashboard.groupedResources.once('reset', () => {
    logger.log('resources synced and grouped resources prepared')
    App.state.dashboard.resourcesDataSynced = true
  })

  App.state.dashboard.tasksDataSynced = false
  App.state.tasks.once('sync',() => {
    logger.log('tasks synced')
    App.state.dashboard.tasksDataSynced = true
  })

  var resourcesToFetch = 6
  if (fetchTasks) resourcesToFetch += 2
  var done = after(resourcesToFetch, () => {
    App.state.loader.visible = false
  })

  const step = () => {
    App.state.loader.step()
    done()
  }

  if (fetchTasks) {
    const nextStep = () => {
      step()
      App.state.tasks.fetch({
        success: () => {
          App.state.dashboard.groupTasks()
          App.state.workflows.forEach(workflow => {
            WorkflowActions.populate(workflow)
          })

          ApprovalActions.check()
          step()
        },
        error: step,
        reset: true
      })
    }
    App.state.workflows.fetch({ success: nextStep, error: nextStep })
  }

  App.state.events.fetch({ success: step, error: step })
  // App.state.scripts.fetch({ success: step, error: step })
  App.state.files.fetch({ success: step, error: step })
  App.state.hosts.fetch({ success: step, error: step })
  App.state.tags.fetch({ success: step, error: step })
  App.state.members.fetch({ success: step, error: step })
  App.state.resources.fetch({
    success: () => {
      App.state.dashboard.groupResources()
      step()
    },
    error: step,
    reset: true
  })
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
    monitors: App.state.resources,
    tasks: App.state.dashboard.groupedTasks,
    renderTasks: options.renderTasks,
    renderStats: options.renderStats
  })
}
