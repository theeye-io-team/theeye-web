import App from 'ampersand-app'
import SocketsWrapper from './wrapper'
import HostStatsActions from 'actions/hoststats'
import SessionActions from 'actions/session'
import * as OperationsConstants from 'constants/operations'
import * as TabsConstants from 'constants/tabs'
import loggerModule from 'lib/logger'; const logger = loggerModule('app:sockets')

//const defaultTopics = [
//  'monitor-state',
//  'job-crud',
//  'job-scheduler-crud',
//  'indicator-crud',
//  'host-integrations-crud', // host integrations changes
//  'host-registered'
//]

export default () => {
  // initialize sails sockets
  let session = App.state.session

  App.sockets = createWrapper()

  App.listenToAndRun(session, 'change:logged_in', () => {
    const logged_in = session.logged_in
    if (logged_in === undefined) { return }
    if (logged_in === true) {
      App.sockets.connect({ access_token: session.access_token }, err => { })
    } else {
      App.sockets.disconnect()
    }
  })
}

const createWrapper = () => {
  return new SocketsWrapper({
    // socket events handlers
    // Web UI handled events
    events: {
      'host-stats': event => {
        // subscribed on demand
        HostStatsActions.applyStateUpdate('dstat', event.model)
      },
      'host-processes': event => {
        // subscribed on demand
        HostStatsActions.applyStateUpdate('psaux', event.model)
      },
      'monitor-state': (event) => {
        App.actions.resource.applyStateUpdate(event.model.id, event.model)
        App.actions.tabs.showNotification(TabsConstants.MONITORS)
      },
      'job-result-render': event => { // always subscribed by default
        App.actions.notification.handleResultNotification(event.model)
      },
      'host-integrations-crud': (event) => {
        App.actions.host.applyStateUpdate(event.model.id, event.model)
      },
      'host-registered': event => {
        App.actions.dashboard.loadNewRegisteredHostAgent(event.model)
        App.actions.tabs.showNotification(TabsConstants.MONITORS)
      },
      'notification-crud': event => { // always subscribed
        App.actions.notification.handleNotification(event.model)
        App.actions.tabs.showNotification(TabsConstants.NOTIFICATIONS)
      },
      'job-crud': (event) => {
        if (
          event.operation === OperationsConstants.UPDATE ||
          event.operation === OperationsConstants.CREATE ||
          event.operation === OperationsConstants.REPLACE
        ) {
          App.actions.job.applyStateUpdate(event.model)
          App.actions.host.applyIntegrationJobStateUpdates(event.model)
          App.actions.tabs.showNotification(TabsConstants.WORKFLOWS)
        }
      },
      'job-scheduler-crud': event => {
        // model is a scheduler job
        App.actions.scheduler.applyStateUpdate(event.model)
      },
      'task-crud': (event) => {
        App.actions.task.applyStateUpdate(event.model)
        App.actions.tabs.showNotification(TabsConstants.WORKFLOWS)
      },
      'indicator-crud': (event) => {
        App.actions.indicator.applyStateUpdate(event.model, event.operation)
        App.actions.tabs.showNotification(TabsConstants.INDICATORS)
      },
      'message-crud': (event) => {
        console.log(event)
      },
      'session': (event) => {
        App.actions.session.verifyCustomerChange(event.organization)
        App.actions.session.applyStateUpdate(event.model, event.operation)
      },
    },
    config: {
      url: App.config.socket_url
    }
  })
}
