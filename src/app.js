//import 'jquery' // imported by webpack. not required
import 'bootstrap'
import config from 'config'

import App from 'ampersand-app'
import AppState from 'state'
import Router from 'router'
import ChatBox from 'components/chat'
import RootContainer from 'view/root-container'
import query from 'lib/query-params'
const logger = require('lib/logger')('app')

require('app/events')
const sockets = require('app/sockets')
const session = require('app/session')
const models = require('app/models')
const experimentalFeatures = require('app/experimental')
const checkLicense = require('app/license')

import 'assets/styles'

// Extends our main app singleton
App.extend({
  config: config,
  EasterEggs: require('components/easter-eggs'),
  Router: new Router(),
  state: new AppState(),
  init () {
    this.bindDocumentEvents()
    this.initState( () => {
      App.state.loader.visible = false // app finish loading.
      this.registerComponents()
      session()
      sockets()
      models()
      experimentalFeatures()
      checkLicense()
    })
  },
  initState (next) {
    // listen session restored
    this.listenToOnce(this.state.session,'restored',next)
    this.state.appInit()
  },
  navigate (page) {
    var url = (page.charAt(0) === '/') ? page.slice(1) : page
    //App.state.loader.visible = true
    App.Router.navigate(url)
  },
  registerComponents () {
    const state = App.state

    const chat = new ChatBox.ChatBoxBaloon()

    const root = new RootContainer({ el: document.getElementById('root') })
    state.on('change:currentPage', () => {
      //this.listenToAndRun(App.state.currentPage, 'change:rendered', this.togglePageLoader)
      root.updateState({ currentPage: state.currentPage })
    })
    root.on('click:localPath', (event) => {
      // skip navigation when on same page
      // TODO: check this behavior on all pages
      if (event.localPath === window.location.pathname) return
      App.navigate(event.localPath)
    })
  },
  //togglePageLoader: function (state, prevValue) {
  //  App.state.loader.visible = App.state.currentPage
  //    ? !App.state.currentPage.rendered
  //    : false
  //},
  bindDocumentEvents () {
    const oninput = (event) => {
      //logger.log('document input')
      App.trigger('document:input', event)
    }
    document.addEventListener('input', oninput, false)

    const onclick = (event) => {
      //logger.log('document click')
      App.trigger('document:click', event)
    }
    document.addEventListener('click', onclick, false)

    const onkeydown = (event) => {
      //logger.log('document keydown')
      App.trigger('document:keydown', event)
    }
    document.addEventListener('keydown', onkeydown, false)
  },
  /**
   * @summary replace current session customer
   */
  customerChange (customer) {
    this.state.session.customer.clear()
    this.state.session.customer.set( customer.serialize() )
    this.state.session.customer.fetch()
    this.state.reset()
    this.Router.reload()
    checkLicense()
  }
})

App.init()
