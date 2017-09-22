'use strict'

//import 'jquery' // imported by webpack. not required
import 'bootstrap'
require('./app/index')

import App from 'ampersand-app'
import AppState from 'state'
import Router from 'router'
import Loader from 'components/loader'
import ChatBox from 'components/chat'
import RootContainer from 'view/root-container'
//import RootContainer from './container'
import query from 'lib/query-params'
const logger = require('lib/logger')('app')

import 'assets/styles'

const bindDocumentEvents = () => {
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
}

window.App = App

// Extends our main app singleton
App.extend({
  EasterEggs: require('components/easter-eggs'),
  Router: new Router(),
  init () {
    this.state = new AppState()

    new Loader()
    new ChatBox.ChatBoxBaloon()

    //App.state.loader.visible = true

    bindDocumentEvents()
    new RootContainer({ el: document.getElementById('root') })

    // if has access token, should validate it first? I cannot work offline
    this.listenToAndRun(App.state.session,'change:logged_in',() => {
      let logged_in = App.state.session.logged_in
      if (logged_in === undefined) return // wait until it is set

      if (!App.Router.history.started()) {
        App.Router.history.start({ pushState: (document.origin!=='null') })
      }

      let publicRoute = ['login','register','activate'].find(route => {
        let routeRegex = new RegExp(route)
        return routeRegex.test(window.location.pathname)
      })

      if (publicRoute) {
        if (logged_in) {
          App.Router.redirectTo('dashboard',{replace: true})
        }
      } else {
        // not publicRoute
        if (!logged_in) {
          App.Router.redirectTo('login',{replace: true})
        } else {
          if (document.origin=='null') {
            App.Router.redirectTo('dashboard',{replace: true})
          }
        }
      }
      // else {
      //  do nothing
      //}
    })
  },
  navigate (page) {
    var url = (page.charAt(0) === '/') ? page.slice(1) : page
    if (window.location.pathname.slice(1) === url) return // cancel if page is current
    this.Router.history.navigate(url,{ trigger: true })
  },
  reload (params, append=false) {
    let qs
    if (!append) {
      qs = query.set(params)
    } else {
      qs = query.set( Object.assign({}, query.get(), params) )
    }
    App.Router.navigate(window.location.pathname + `?${qs}`,{replace: true})
    App.Router.reload()
  }
})

App.init()
