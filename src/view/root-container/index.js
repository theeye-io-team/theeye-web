'use strict'

import App from 'ampersand-app'
import View from 'ampersand-view'
import ViewSwitcher from 'ampersand-view-switcher'
import localLinks from 'local-links'
import PopupView from 'components/popup'
import Navbar from 'view/navbar'
import Menu from 'view/menu'

import './style.less'

const EmptyView = View.extend({
  template: `<div></div>`
})

export default View.extend({
  autoRender: true,
  props: {
    menu_switch: ['boolean', false, false],
    title: ['string',false,'TheEye']
  },
  bindings: {
    menu_switch: [{
      hook: 'menu-container',
      type: 'booleanClass',
      no: 'menu-container-contracted',
      yes: 'menu-container-expanded'
    },
    {
      hook: 'page-container',
      type: 'booleanClass',
      no: 'page-container-expanded',
      yes: 'page-container-contracted'
    }]
  },
  template: function () {
    let url = App.config.landing_page_url
    const year = new Date().getFullYear()
    let str = `
      <div class="main-container">
        <nav></nav>
        <div data-hook="popup"></div>
        <div data-hook="menu-container" class="menu-container"></div>
        <div data-hook="page-container" class="page-container"></div>
        <footer>
          <a target="_blank" href="https://theeye.io">theeye.io</a> | Copyright © ${year}
        </footer>
      </div>
    `
    return str
  },
  initialize () {
    this.title = 'TheEye'
    View.prototype.initialize.apply(this,arguments)
  },
  updateState (state) {
    if (!state.currentPage) {
      this.pageSwitcher.set( new EmptyView() )
    } else {
      this.pageSwitcher.set(state.currentPage)
    }
  },
  events: {
    'click a[href]': function (event) {
      if (/mailto:/.test(event.delegateTarget.href) === true) return

      var localPath = localLinks.pathname(event)
      if (localPath) {
        event.stopPropagation()
        event.preventDefault()
        event.localPath = localPath
        this.trigger('click:localPath', event)
      }
    }
  },
  render () {
    // main renderer
    this.renderWithTemplate(this)

    this.registerSubview(
      new Navbar({ el: this.query('nav') })
    )

    //this.registerSubview(
    //  new Menu({ el: this.queryByHook('menu-container') })
    //)

    this.renderSubview(
      new PopupView({}), this.queryByHook('popup')
    )

    // init and configure our page switcher
    this.pageSwitcher = new ViewSwitcher({
      el: this.queryByHook('page-container'),
      show (view) {
        document.title = view.pageTitle || 'TheEye'
        document.scrollTop = 0
      }
    })

    this.listenToAndRun(App.state.session, 'change:logged_in', () => {
      this.updateLoggedInComponents(App.state.session)
    })

    this.listenToAndRun(App.state.navbar, 'change:menuSwitch', () => {
      this.menu_switch = App.state.navbar.menuSwitch
    })
  },
  updateLoggedInComponents (state) {
    const logged_in = state.logged_in
    if (logged_in === undefined) return
    if (logged_in === true) {
      this.renderLoggedInComponents()
    } else {
      this.destroyLoggedInComponents()
    }
  },
  renderLoggedInComponents () {
    this.menu = new Menu()
    this.renderSubview(
      this.menu,
      this.queryByHook('menu-container')
    )

    this.queryByHook('page-container').classList.remove('page-container-nomenu')
  },
  destroyLoggedInComponents () {
    if (this.menu) {
      this.menu.remove()
    }

    this.queryByHook('page-container').classList.add('page-container-nomenu')
  }
})
