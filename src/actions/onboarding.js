import App from 'ampersand-app'
import XHR from 'lib/xhr'
const logger = require('lib/logger')('actions:onboarding')
const config = require('config')
import bootbox from 'bootbox'
import assign from 'lodash/assign'

module.exports = {
  updateOnboarding (value) {
    const user = App.state.session.user

    var body = {}
    body.onboardingCompleted = value

    XHR.send({
      url: `${config.app_url}/session/profile/onboarding`,
      method: 'PUT',
      jsonData: body,
      fail: (err) => {
      },
      done: (settings) => {
        user.set(settings)
      }
    })
  },
  showOnboarding () {
    App.state.onboarding.onboardingActive = true
  },
  hideOnboarding () {
    App.state.onboarding.onboardingActive = false
  },
  showTaskLastStep () {
    App.state.onboarding.showTaskLastStep = true
  }
}
