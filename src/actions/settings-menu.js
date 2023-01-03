import App from 'ampersand-app'

import CustomerSettings from 'view/settings/customer'
import ProfileSettings from 'view/settings/user'

export default {
  hide (menuName) {
    App.state.settingsMenu[menuName].visible = false
  },
  show (menuName) {
    let state = App.state.settingsMenu[menuName]
    if (!state.current_tab) {
      state.current_tab = state.default_tab
    }
    state.visible = true 

    if (menuName === "customer") {
      window.settings = new CustomerSettings()
    }
    if (menuName === "user") {
      window.settings = new ProfileSettings()
    }
  },
  toggle (menuName) {
    App.state.settingsMenu[menuName].toggle('visible')
  },
  toggleTab (menuName, tabId) {
    App.state.settingsMenu[menuName].current_tab = tabId
  }
}
