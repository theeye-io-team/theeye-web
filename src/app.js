'use strict'

//import 'jquery' // imported by webpack. not required
import 'bootstrap'
import 'app/init'

import App from 'ampersand-app'
import AppState from 'state'
import Router from 'router'
import Loader from 'components/loader'
import ChatBox from 'components/chat'
import RootContainer from 'view/root-container'
import query from 'lib/query-params'
const logger = require('lib/logger')('app')

window.App = App

// Extends our main app singleton
App.extend({
  EasterEggs: require('components/easter-eggs'),
  Router: new Router(),
  bindDocumentEvents () {
    const oninput = (event) => {
      logger.log('document input')
      App.trigger('document:input', event)
    }
    document.addEventListener('input', oninput, false)

    const onclick = (event) => {
      logger.log('document click')
      App.trigger('document:click', event)
    }
    document.addEventListener('click', onclick, false)

    const onkeydown = (event) => {
      logger.log('document keydown')
      App.trigger('document:keydown', event)
    }
    document.addEventListener('keydown', onkeydown, false)
  },
  init () {
    this.state = new AppState()

    new Loader()
    new ChatBox.ChatBoxBaloon()

    App.state.loader.visible = true

    this.bindDocumentEvents()

    this.listenTo(App.state.session, 'change:ready', () => {
      if (App.state.session.ready) {
        App.state.loader.visible = false
        const elem = document.querySelector('body #root-container')
        new RootContainer({ el: elem })

        App.Router.history.start({ pushState: true })
      }
    })
  },
  navigate (page) {
    var url = (page.charAt(0) === '/') ? page.slice(1) : page
    if (window.location.pathname.slice(1) === url) {
      return
    }
    this.Router.history.navigate(url,{ trigger: true })
  },
  reload (params, append=false) {
    if (!append) {
      query.set(params)
    } else {
      query.set( Object.assign({}, query.get(), params) )
    }
  }
})

App.init()
