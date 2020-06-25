import 'bootstrap'
import config from 'config'

import App from 'ampersand-app'
// load application models definitions
require('app/models')
require('app/events')

import AppState from 'state'
import Router from 'router'
import RootContainer from 'view/root-container'

import sockets from 'app/sockets'
import session from 'app/session'
import actions from 'app/actions'
import experimentalFeatures from 'app/experimental'

import 'assets/styles'

function getUserLanguage () {
  const suportedLanguages = ['en', 'es']
  const lang = navigator.language.substring(0, 2)
  return (suportedLanguages.indexOf(lang) > -1) ? lang : 'en'
}

// Extends our main app singleton
App.extend(actions, {
  language: getUserLanguage(),
  config: config,
  EasterEggs: require('components/easter-eggs').default,
  Router: new Router(),
  state: new AppState(),
  init () {
    this.bindDocumentEvents()
    this.initState(() => {
      App.state.loader.visible = false // app finish loading.
      this.registerComponents()
      session()
      sockets()
      experimentalFeatures()
    })
  },
  initState (next) {
    // listen session restored
    this.listenToOnce(this.state.session, 'restored', next)
    this.state.appInit()
  },
  navigate (page) {
    var url = (page.charAt(0) === '/') ? page.slice(1) : page
    //App.state.loader.visible = true
    App.Router.navigate(url)
  },
  registerComponents () {
    const state = App.state

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
})

App.init()
