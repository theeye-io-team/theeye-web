import App from 'ampersand-app'
import View from 'ampersand-view'
import Searchbox from './searchbox'
import NavbarActions from 'actions/navbar'
import TopMenu from './top-menu'
import PlusMenuButton from './plus-menu-button'

import acls from 'lib/acls'
//import logo from './logo.png'
import logo from './logo.svg'
import './styles.less'

export default View.extend({
  template: () => {
    return `
      <nav data-component="navbar" class="navbar navbar-inverse navbar-fixed-top navbar-eyemenu">
      	<div class="navbar-header">
          <span data-hook="menu-toggle" class="eyemenu-panel-launcher burger-button">
            <i class="fa fa-bars" aria-hidden="true"></i>
          </span>
          <a class="navbar-brand" data-hook="theeye-logo">
            <img src="${logo}" alt="TheEye">
          </a>
          <div data-hook="buttons-container" class="navbar-buttons navbar-right"></div>
          <div data-hook="searchbox-container" class="searchbox-container"></div>
          <div class="license-header col-xs-10 col-sm-8 col-md-9">
            <p class="alert alert-warning">
              Your license has expired!
              <br />
              Please contact your service provider to activate the product again
            </p>
          </div>
      	</div>
      </nav>
    `
  },
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
    },
    'click [data-hook=menu-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleMenu()
      return false
    }
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
    // Check if navbar is hidden and re-enable it if needed
    if (!this.visible) App.actions.navbar.setVisibility(true)

    // search box
    this.searchbox = new Searchbox()
    this.renderSubview(
      this.searchbox,
      this.queryByHook('searchbox-container')
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
    if (this.plusMenuButton) this.plusMenuButton.remove()
    if (this.topMenu) this.topMenu.remove()
  }
})
