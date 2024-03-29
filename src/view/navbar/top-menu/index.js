import App from 'ampersand-app'
import View from 'ampersand-view'
import Backdrop from 'components/backdrop'
import NavbarActions from 'actions/navbar'

import './style.less'

export default View.extend({
  template: `
    <div class="profile eyemenu-panel-launcher pull-left">
      <i data-hook="user-menu-toggle" class="fa fa-user-circle-o"></i>
      <div class="user-menu-popup" data-hook="user-menu-popup">
        <div data-hook="profile-container"></div>
        <ul class="topmenu-links">
          <li><a data-hook="settings-menu" href="#" class="topmenu-icon fa-gear">Settings</a></li>
          <li><a href="#" data-hook="logout" class="topmenu-icon fa-sign-out">Logout</a></li>
        </ul>
      </div>
    </div>`,
  props: {
    open: ['boolean', false, false]
  },
  bindings: {
    open: {
      type: 'toggle',
      hook: 'user-menu-popup'
    }
  },
  events: {
    'click [data-hook=user-menu-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleTopMenu()
      return false
    },
    'click a[data-hook=settings-menu]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleTopMenu()
      App.actions.settingsMenu.show('user')
      return false
    },
    'click [data-hook=logout]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleTopMenu()
      App.navigate('logout')
      return false
    }
  },
  initialize () {
    this.listenToAndRun(App.state.navbar, 'change:topMenuSwitch', () => {
      this.open = App.state.navbar.topMenuSwitch
    })
  },
  render () {
    this.renderWithTemplate(this)
    this.renderProfile()
    this.renderBackdrop()
  },
  renderProfile () {
    const profile = new UserProfile({
      el: this.queryByHook('profile-container'),
      model: App.state.session.user
    })
    profile.render()
    this.registerSubview(profile)
  },
  renderBackdrop () {
    const backdrop = new Backdrop({
      zIndex: 1029,
      opacity: 0
    })
    backdrop.onClick = (event) => {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleTopMenu()
      return false
    }
    this.on('change:open', () => {
      backdrop.visible = this.open
    })
  }
})

const UserProfile = View.extend({
  template: `
    <div class="profile-data">
      <div class="user-cred">
        <span class="username" data-hook="username"></span>
        <span class="small" data-hook="credential"></span>
      </div>
      <span data-hook="name" href="#"></span>
      <span data-hook="email" href="#"></span>
    </div>
  `,
  bindings: {
    'model.credential': { hook: 'credential' },
    'model.username': { hook: 'username' },
    'model.name': { hook: 'name' },
    'model.email': { hook: 'email' }
  }
})
