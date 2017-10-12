'use strict'

import App from 'ampersand-app'

module.exports = {
  toggleMenu () {
    App.state.navbar.toggle('menuSwitch')
  }
}
