'use strict'

import App from 'ampersand-app'
import XHR from 'lib/xhr'
const logger = require('lib/logger')('app:events')

App.listenTo(XHR, 'unauthorized', () => {
  if (!App.state) return
  if (!App.state.session) return
  if (!App.state.session.logged_in) return
  logger.log('session expired')
  App.state.alerts.info('Session has expired.','Please, login again')
  App.navigate('logout')
})
