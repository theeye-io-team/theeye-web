'use strict'

import PageView from 'view/page/dashboard'
import App from 'ampersand-app'
import URI from 'urijs'
import uniq from 'lodash/uniq'
import SocketsWrapper from 'lib/sockets'
import ResourceAction from 'actions/resource'
import JobAction from 'actions/job'

const logger = require('lib/logger')('router:dashboard')

function Route () { }

module.exports = Route

Route.prototype = {
  route () {
    const page = index()
    App.state.set('currentPage', page)
  }
}

const fetchData = (options) => {
  const { fetchTasks, groupBy } = options

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
      success: () => {
        App.state.dashboard.groupResourcesByTags(groupBy)
      }
    })
  } else {
    // fetch monitors and start page.
    App.state.resources.fetch({
      success: () => {
        App.state.dashboard.groupResourcesByTags(groupBy)
      },
      error: () => { }
    })
    App.state.tasks.fetch({
      success: () => { },
      error: () => { }
    })
  }
}

const index = (next) => {
  var tasks
  var query = URI().search(true)
  var tagsToGroup = getTagsToGroup(query)
  var credential = App.state.session.user.credential

  subscribeSockets()

  const tasksEnabled = Boolean(query.tasks != 'hide' && credential != 'viewer')
  const statsEnabled = Boolean(query.stats == 'show')

  fetchData({
    fetchTasks: tasksEnabled,
    groupBy: tagsToGroup
  })

  return renderPageView({
    renderTasks: tasksEnabled,
    renderStats: statsEnabled,
    tags: tagsToGroup
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
 * @param {Mixed[]} query uri query string
 * @return {String[]}
 */
const getTagsToGroup = (query) => {
  var tags
  if (Array.isArray(query.tags)) {
    tags = query.tags.map(function(t){
      return t.toLowerCase() 
    });
  } else {
    if (typeof query.tags == 'string') {
      tags = [ query.tags.toLowerCase() ]
    }
  }
  return uniq(tags)
}

/**
 * @param {Object} options
 * @property {Mixed[]} options.renderStats
 * @property {Mixed[]} options.renderTasks
 * @property {String[]} options.tags
 * @return {AmpersandView} page view
 */
const renderPageView = (options) => {
  return new PageView({
    groupedResources: App.state.dashboard.groupedResources,
    tagsSelected: options.tags, /* @todo replace with a collection in the state */
    monitors: App.state.resources,
    tasks: App.state.tasks,
    renderTasks: options.renderTasks,
    renderStats: options.renderStats
  })
}
