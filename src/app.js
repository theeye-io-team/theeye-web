'use strict'

require('jquery')
require('bootstrap')
require('app/init')

import App from 'ampersand-app'
import AppState from 'state'
import Router from 'router'
import Loader from 'components/loader'

window.App = App

// Extends our main app singleton
App.extend({
  Collections: {},
  Router: new Router(),
  init () {
    this.state = new AppState()
    new Loader()
		App.Router.history.start({ pushState: true })
  },
  navigate (page) {
    var url = (page.charAt(0) === '/') ? page.slice(1) : page
    if (window.location.pathname.slice(1) === url) {
      return
    }
    this.Router.history.navigate(url,{ trigger: true })
  }
})

App.init()
