'use strict'

import App from 'ampersand-app'

module.exports = {
  toggleMenu () {
    App.state.navbar.toggle('menuSwitch')
  },
  hideSettingsMenu () {
    App.state.navbar.settingsMenu.visible = false
  },
  toggleSettingsMenu () {
    App.state.navbar.settingsMenu.toggle('visible')
  }
}
