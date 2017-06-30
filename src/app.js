'use strict'

//import 'jquery' // imported by webpack. not required
import 'bootstrap'
import 'app/init'

import App from 'ampersand-app'
import AppState from 'state'
import Router from 'router'
import Loader from 'components/loader'
import ChatBox from 'components/chat'

window.App = App

// Extends our main app singleton
App.extend({
  Collections: {},
  Router: new Router(),
  init () {
    this.state = new AppState()

    new Loader()
    new ChatBox.ChatBoxBaloon()

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
