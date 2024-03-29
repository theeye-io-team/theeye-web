import App from 'ampersand-app'
import SocketsWrapper from './wrapper'
import HostStatsActions from 'actions/hoststats'
import SessionActions from 'actions/session'
import * as OperationsConstants from 'constants/operations'
import * as TabsConstants from 'constants/tabs'
import * as TopicConstants from 'constants/topic'
import loggerModule from 'lib/logger'; const logger = loggerModule('app:sockets')

export default () => {
  const session = App.state.session

  App.sockets = createWrapper()

  App.listenToAndRun(session, 'change:logged_in', () => {
    if (session.logged_in === undefined) { return }
    if (session.logged_in === true) {
      App.sockets.connect({ access_token: session.access_token })
    } else {
      App.sockets.disconnect()
    }
  })

  let disconnectTime

  App.sockets.on('disconnected', () => {
    logger.log('socket disconnected')
    disconnectTime = new Date().getTime()
  })

  App.sockets.on('reconnect_attempt', (attempt) => {
    logger.log(`reconnecting attempt ${attempt}`)
    App.state.alerts.danger(`reconnecting socket #attemp ${attempt}...`)
  })

  App.sockets.on('reconnect', (attempt) => {
    App.state.alerts.success('sockets reconnected')

    let secondsElapsed = (new Date().getTime() - disconnectTime) / 1000
    if (secondsElapsed > 900) {
      App.state.alerts.notice('You were offline for more than 15 minutes', 'Refresh the App to receive all the updates')
    }
  })

  App.sockets.on('server_disconnected', () => {
    App.state.alerts.danger('Your are offline!', 'Your session expired and must relogin', { timeout: 0 })
  })
}

const createWrapper = () => {
  const events = {}

  events[ TopicConstants.HOST_STATS ] = (event) => {
    // subscribed on demand
    HostStatsActions.applyStateUpdate('dstat', event.model)
  }

  events[ TopicConstants.HOST_PROCESSES ] = (event) => {
    // subscribed on demand
    HostStatsActions.applyStateUpdate('psaux', event.model)
  }

  events[ TopicConstants.MONITOR_STATE ] = (event) => {
    App.actions.resource.applyStateUpdate(event.model.id, event.model)
    App.actions.tabs.showNotification(TabsConstants.MONITORS)
  }

  events[ TopicConstants.HOST_INTEGRATIONS_CRUD ] = (event) => {
    App.actions.host.applyStateUpdate(event.model.id, event.model)
  }

  events[ TopicConstants.HOST_REGISTERED ] = (event) => {
    App.actions.dashboard.loadNewRegisteredHostAgent(event.model)
    App.actions.tabs.showNotification(TabsConstants.MONITORS)
  }

  events[ TopicConstants.NOTIFICATION_CRUD ] = (event) => {
    App.actions.notification.handleNotification(event.model)
    App.actions.tabs.showNotification(TabsConstants.NOTIFICATIONS)
  }

  events[ TopicConstants.JOB_CRUD ] = (event) => {
    if (
      event.operation === OperationsConstants.UPDATE ||
      event.operation === OperationsConstants.CREATE ||
      event.operation === OperationsConstants.REPLACE
    ) {
      App.actions.job.applyStateUpdate(event)
      App.actions.tabs.showNotification(TabsConstants.WORKFLOWS)
    }
  }

  events[ TopicConstants.SCHEDULE_CRUD ] = (event) => {
    // something was added to the scheduler
    App.actions.scheduler.applyStateUpdate(event.model, event.operation)
  }

  events[ TopicConstants.TASK_CRUD ] = (event) => {
    App.actions.task.applyStateUpdate(event.model)
    App.actions.tabs.showNotification(TabsConstants.WORKFLOWS)
  }

  events[ TopicConstants.INDICATOR_CRUD ] = (event) => {
    App.actions.indicator.applyStateUpdate(event.model, event.operation)
    App.actions.tabs.showNotification(TabsConstants.INDICATORS)
  }

  events['session'] = (event) => {
    App.actions.session.verifyCustomerChange(event.organization)
    App.actions.session.applyStateUpdate(event.model, event.operation)
  }

  // work in progress. messaging system
  events['message-crud'] = (event) => {
    console.log(event)
  }

  return new SocketsWrapper({
    // socket events handlers
    // Web UI handled events
    events,
    config: {
      url: App.config.socket_url
    }
  })
}
