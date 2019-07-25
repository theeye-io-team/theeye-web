/* global io */
'use strict'

import App from 'ampersand-app'
import SocketsWrapper from 'lib/sockets'
import ResourceActions from 'actions/resource'
import IndicatorActions from 'actions/indicator'
import HostStatsActions from 'actions/hoststats'
import JobActions from 'actions/job'
import NotificationActions from 'actions/notifications'
import HostActions from 'actions/host'
import TaskActions from 'actions/task'
import SessionActions from 'actions/session'
const logger = require('lib/logger')('app:sockets')
import OperationsConstants from 'constants/operations'

const defaultTopics = [
  //'host-stats',
  //'host-processes',
  'monitor-state',
  'job-crud',
  'indicator-crud',
  //'task-crud',
  //'task-interrupted',
  'host-integrations-crud', // host integrations changes
  'host-registered'
]

module.exports = () => {
  // initialize sails sockets
  let session = App.state.session

  const subscribe = () => {
    App.sockets.subscribe({
      query: {
        customer: session.customer.name,
        topics: defaultTopics
      }
    })
  }

  const updateSubscriptions = () => {
    if (!session.customer.id) return

    // unsubscribe
    App.sockets.unsubscribe({
      onUnsubscribed: () => {

        // ... then subscribe again to new customer notifications
        subscribe()
      }
    })
  }

  App.sockets = createWrapper()

  App.listenToAndRun(session, 'change:logged_in', () => {
    const logged_in = session.logged_in
    if (logged_in===undefined) { return }
    if (logged_in===true) {
      // get a socket and wait connected event
      App.sockets.on('connected', () => {
        logger.debug('socket connected')
        subscribe() // events subscription
        App.listenTo(session.customer, 'change:id', updateSubscriptions)
      })
      App.sockets.connect(err => { })
    } else {
      App.sockets.disconnect()
      App.stopListening(session.customer, 'change:id', updateSubscriptions)
    }
  })
}

const createWrapper = () => {
  return new SocketsWrapper({
    events: { // topics
      // socket events handlers
      'notification-crud': event => { // always subscribed
        NotificationActions.handleNotification(event.model)
      },
      'session-customer-changed': event => { // temporal fix
        SessionActions.verifyCustomerChange(event.organization)
      },
      // subscribed on demand
      'host-stats': event => {
        HostStatsActions.applyStateUpdate('dstat', event.model)
      },
      // subscribed on demand
      'host-processes': event => {
        HostStatsActions.applyStateUpdate('psaux', event.model)
      },
      // subscribed by default. see defaultTopics definition
      'monitor-state': (event) => {
        ResourceActions.applyStateUpdate(event.model.id, event.model)
      },
      'job-crud': (event) => {
        if (
          event.operation === OperationsConstants.UPDATE ||
          event.operation === OperationsConstants.CREATE ||
          event.operation === OperationsConstants.REPLACE
        ) {
          JobActions.applyStateUpdate(event.model)
          HostActions.applyIntegrationJobStateUpdates(event.model)
        }
      },
      'host-integrations-crud': (event) => {
        HostActions.applyStateUpdate(event.model.id, event.model)
      },
      'host-registered': event => {
        App.actions.dashboard.loadNewRegisteredHostAgent(event.model)
      },
      'task-crud': (event) => {
        TaskActions.applyStateUpdate(event.model)
      },
      'indicator-crud': (event) => {
        IndicatorActions.applyStateUpdate(event.model, event.operation)
      },
    }
  })
}
