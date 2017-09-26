'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
const logger = require('lib/logger')('app:events')

App.listenTo(XHR,'unauthorized', () => {
  logger.log('session expired')
  App.state.alerts.info('Session has expired.','Please, login again')
  App.navigate('logout')
})
