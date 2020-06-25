import App from 'ampersand-app'
import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import loggerModule from 'lib/logger'; const logger = loggerModule('app:events')

App.listenTo(XHR, 'unauthorized', () => {
  if (!App.state) return
  if (!App.state.session) return
  if (!App.state.session.logged_in) return
  logger.log('session expired')

  if (!App.state.session.relogin_message) {
    App.state.session.relogin_message = true
    bootbox.alert({
      title: 'Session has expired.',
      message: 'Please, login again',
      callback: () => {
        App.navigate('logout')
        App.state.session.relogin_message = false
      }
    })
  }
})
