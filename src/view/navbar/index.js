import App from 'ampersand-app'
import View from 'ampersand-view'
import Searchbox from './searchbox'
import NavbarActions from 'actions/navbar'
import TopMenu from './top-menu'
import PlusMenuButton from './plus-menu-button'

import acls from 'lib/acls'
import logo from './logo.png'

const MenuButton = View.extend({
  template: `
    <div>
      <span data-hook="menu-toggle" class="eyemenu-panel-launcher burger-button pull-left">
        <i class="fa fa-bars" aria-hidden="true"></i>
      </span>
    </div>
  `,
  events: {
    'click [data-hook=menu-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleMenu()
      return false
    }
  }
})

export default View.extend({
  autoRender: true,
  props: {
    licenseExpired: ['boolean', true, false],
    visible: ['boolean', true, true]
  },
  bindings: {
    licenseExpired: [
      {
        type: 'toggle',
        invert: true,
        selector: '.header-tools'
      },
      {
        type: 'toggle',
        selector: '.license-header'
      }
    ],
    visible: { type: 'toggle' }
  },
  events: {
    'click a[data-hook=theeye-logo]': function (event) {
      if (App.state.session.logged_in) {
        App.Router.navigate('dashboard')
      } else {
        window.location.href = 'https://theeye.io'
      }
    }
  },
  template: () => {
    let html = `
      <nav class="navbar navbar-inverse navbar-fixed-top navbar-eyemenu">
      	<div class="navbar-header">
          <div>
            <div data-hook="menu-button-container"></div>
            <a class="navbar-brand" data-hook="theeye-logo">
              <img src="${logo}" alt="TheEye">
            </a>
      		</div>
          <div class="license-header col-xs-10 col-sm-8 col-md-9">
            <p class="alert alert-warning">
              Your license has expired!
              <br />
              Please contact your service provider to activate the product again
            </p>
          </div>
          <div class="header-tools navbar-right col-xs-5 col-sm-8 col-md-9">
            <div data-hook="buttons-container" class="navbar-buttons navbar-right"></div>
            <div data-hook="searchbox-container"></div>
          </div>
      	</div>
      </nav>
    `

    return html
  },
  render () {
    this.renderWithTemplate()

    this.listenToAndRun(App.state.session, 'change:logged_in', () => {
      this.updateState(App.state.session)
    })
    this.listenToAndRun(App.state.session, 'change:logged_in change:licenseExpired', () => {
      this.updateLicenseStatus(App.state.session)
    })
    this.listenToAndRun(App.state.navbar, 'change:visible', () => {
      this.updateNavbarVisibility(App.state.navbar)
    })
  },
  updateLicenseStatus (state) {
    const {logged_in: loggedIn, licenseExpired} = state

    this.licenseExpired = (licenseExpired === true && Boolean(loggedIn))
  },
  updateNavbarVisibility (state) {
    this.visible = state.visible
  },
  updateState (state) {
    const logged_in = state.logged_in
    if (logged_in === undefined) return
    if (logged_in === true) {
      this.renderLoggedInComponents()
    } else {
      this.destroyLoggedInComponents()
    }
  },
  renderLoggedInComponents () {
    // search box
    this.searchbox = new Searchbox()
    this.renderSubview(
      this.searchbox,
      this.queryByHook('searchbox-container')
    )

    // menu button
    this.menuButton = new MenuButton()
    this.renderSubview(
      this.menuButton,
      this.queryByHook('menu-button-container')
    )

    if (acls.hasAccessLevel('admin')) {
      this.plusMenuButton = new PlusMenuButton()
      this.renderSubview(
        this.plusMenuButton,
        this.queryByHook('buttons-container')
      )
    }

    this.topMenu = new TopMenu()
    this.renderSubview(
      this.topMenu,
      this.queryByHook('buttons-container')
    )
  },
  destroyLoggedInComponents () {
    if (this.searchbox) this.searchbox.remove()
    if (this.menuButton) this.menuButton.remove()
    if (this.plusMenuButton) this.plusMenuButton.remove()
    if (this.topMenu) this.topMenu.remove()
  }
})
