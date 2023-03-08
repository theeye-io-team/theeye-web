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
    const logged_in = session.logged_in
    if (logged_in === undefined) { return }
    if (logged_in === true) {
      App.sockets.connect({ access_token: session.access_token })
    } else {
      App.sockets.disconnect()
    }
  })

  let numAttempts = 0
  let disconnectTime
  App.sockets.on('disconnected', () => {
    logger.log('socket disconnected')
    disconnectTime = new Date().getTime()
  })

  App.sockets.on('reconnecting', (attempt) => {
    logger.log('reconnecting')
    numAttempts++
    App.state.alerts.danger(`sockets disconnected, reconnecting #attemp ${numAttempts}...`)
  })

  App.sockets.on('reconnect', () => {
    numAttempts = 0
    let timeUnit = 'seconds'
    let endSecs = (new Date().getTime() - disconnectTime) / 1000
    if (endSecs > 60) {
      endSecs = endSecs / 60
      timeUnit = 'minutes'
    }
    if (endSecs > 60) {
      endSecs = endSecs / 60
      timeUnit = 'hours'
    }

    App.state.alerts.success(`sockets reconnected! you were offline ${endSecs} ${timeUnit}`)
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
