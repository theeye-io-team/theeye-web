'use strict'

import PageView from 'view/page/dashboard'
import App from 'ampersand-app'
import uniq from 'lodash/uniq'
import SocketsWrapper from 'lib/sockets'
import ResourceAction from 'actions/resource'
import JobAction from 'actions/job'
import search from 'lib/query-params'

const logger = require('lib/logger')('router:dashboard')

function Route () { }

module.exports = Route

Route.prototype = {
  route () {
    const query = search.get()
    setStateFromQueryString(query)

    const page = index(query)
    App.state.set('currentPage', page)
  },
}

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

  subscribeSockets()

  const tasksEnabled = Boolean(query.tasks != 'hide' && credential != 'viewer')
  const statsEnabled = Boolean(query.stats == 'show')

  fetchData({ fetchTasks: tasksEnabled })

  return renderPageView({
    renderTasks: tasksEnabled,
    renderStats: statsEnabled
  })
}

const subscribeSockets = () => {
  // connect sockets and start listening to events
  App.sockets = new SocketsWrapper({
    io: window.io,
    channel: '/sockets/subscribe',
    query: {
      customer: App.state.session.customer.name,
      topics: ['resources','jobs']
    },
    onSubscribed (data,jwr) {
      if (jwr.statusCode === 200) {
        logger.log('subscribed to resources notifications')
      } else {
        logger.error('error subscribing to resources notifications')
        logger.error(jwr);
      }
    },
    events: {
      'resource:update': ResourceAction.update,
      'job:update': JobAction.update,
    }
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
