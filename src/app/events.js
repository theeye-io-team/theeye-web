import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
const logger = require('lib/logger')('app:events')

App.listenTo(XHR, 'unauthorized', () => {
  if (!App.state) return
  if (!App.state.session) return
  if (!App.state.session.logged_in) return
  logger.log('session expired')

  bootbox.alert({
    title: 'Session has expired.',
    message: 'Please, login again',
    callback: () => {
      App.navigate('logout')
    }
  })
})
