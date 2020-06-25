import App from 'ampersand-app'
import XHR from 'lib/xhr'
import loggerModule from 'lib/logger'; const logger = loggerModule('actions:onboarding')
import bootbox from 'bootbox'
import assign from 'lodash/assign'

export default {
  updateOnboarding (value) {
    const user = App.state.session.user
    user.onboardingCompleted = value

    XHR.send({
      url: `${App.config.api_url}/session/profile/onboarding`,
      method: 'PUT',
      jsonData: { onboardingCompleted: value }
    })
  },
  onboardingCompleted () {
    const user = App.state.session.user
    user.onboardingCompleted = true
    this.hideOnboarding()
    XHR.send({
      url: `${App.config.api_url}/session/profile/onboarding/completed`,
      method: 'PUT'
    })
  },
  activateOnboarding (force) {
    if (force === true || App.state.session.user.onboardingCompleted !== true) {
      App.state.onboarding.onboardingActive = true
    }
  },
  hideOnboarding () {
    App.state.onboarding.onboardingActive = false
  },
  showTaskLastStep () {
    App.state.onboarding.showTaskLastStep = true
  }
}
