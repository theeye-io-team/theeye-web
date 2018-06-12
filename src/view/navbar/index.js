import App from 'ampersand-app'
import View from 'ampersand-view'
import Searchbox from './searchbox'
import SessionActions from 'actions/session'
import NavbarActions from 'actions/navbar'
import Acls from 'lib/acls'
import html2dom from 'lib/html2dom'
import Backdrop from 'components/backdrop'
import SettingsMenu from './settings'
import InboxView from 'view/inbox'

import logo from './logo.png'
const template = require('./nav.hbs')

const CustomerItemList = View.extend({
  props: {
    active: ['boolean', false, false]
  },
  template: `
    <li data-hook="active" class="eyemenu-client">
      <a href="#">
        <i class="fa fa-user-circle" aria-hidden="true"></i>
        <span data-hook="name">Client Name 1</span>
      </a>
    </li>
  `,
  bindings: {
    'model.name': {
      type: 'text',
      hook: 'name'
    },
    active: {
      type: 'booleanClass',
      name: 'active',
      hook: 'active'
    }
  },
  events: {
    'click a': 'onClickCustomer'
  },
  onClickCustomer (event) {
    event.preventDefault()
    // event.stopPropagation()
    NavbarActions.toggleMenu()
    SessionActions.changeCustomer(this.model.id)
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(App.state.session, 'change:logged_id', () => {
      if (!App.state.session.logged_in) return

      this.listenToAndRun(App.state.session.customer, 'change:id', () => {
        const customer = App.state.session.customer
        if (!customer.id) return
        if (this.model.id === customer.id) {
          this.active = true
        } else if (this.active) this.active = false
      })
    })
  }
})

const CurrentCustomerItem = View.extend({
  template: `
    <div class="eyemenu-secondary-users pull-left">
      <i data-hook="active" class="fa fa-user-circle active" aria-hidden="true"></i>
      <p data-hook="name" class="text-center"></p>
    </div>
  `,
  bindings: {
    'model.name': {
      type: 'text',
      hook: 'name'
    }
  }
})

const UserProfile = View.extend({
  template: `
    <div class="eyemenu-main-user pull-left">
      <i class="fa fa-user-circle" aria-hidden="true"></i>
      <h4 data-hook="username"></h4>
      <span data-hook="email" href="#"></span>
    </div>
  `,
  bindings: {
    'model.username': {
      type: 'text',
      hook: 'username'
    },
    'model.email': {
      type: 'text',
      hook: 'email'
    }
  }
})

const Menu = View.extend({
  template: require('./menu.hbs'),
  props: {
    menu_switch: ['boolean', false, false],
    customers_switch: ['boolean', false, false]
  },
  bindings: {
    menu_switch: {
      hook: 'menu',
      type: 'booleanClass',
      yes: 'eyemenu-panel-show',
      no: 'eyemenu-panel-hide'
    },
    customers_switch: [{
      type: 'toggle',
      hook: 'customers-container'
    }, {
      type: 'toggle',
      hook: 'links-container',
      invert: true
    }, {
      selector: '[data-hook=customers-toggle] i.fa',
      type: 'booleanClass',
      yes: 'fa-angle-up',
      no: 'fa-angle-down'
    }]
  },
  events: {
    'click a[data-hook=settings-menu]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleSettingsMenu()
      return false
    },
    'click [data-hook=links-container] a': function (event) {
      NavbarActions.toggleMenu()
    },
    'click [data-hook=menu-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      NavbarActions.toggleMenu()
      return false
    },
    'click [data-hook=customers-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.toggle('customers_switch')
      return false
    },
    'click [data-hook=logout]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      App.navigate('logout')
      return false
    },
    'click [data-hook=mvc-link]': function (event) {
      window.location.href = event.target.href
    }
  },
  initialize () {
    // this.menu_switch = App.state.navbar.menuSwitch
    this.listenToAndRun(App.state.navbar, 'change:menuSwitch', () => {
      this.menu_switch = App.state.navbar.menuSwitch
      if (!this.menu_switch) {
        this.customers_switch = false
      }
    })
  },
  render () {
    this.renderWithTemplate(this)
    this.renderProfile()
    this.listenToAndRun(App.state.session.user, 'change:credential', () => {
      this.renderMenuLinks()
    })
    this.listenToAndRun(App.state.session.customer, 'change:config', () => {
      this.setChartsLink()
    })
    this.renderBackdrop()
    this.renderSettingsMenu()
  },
  renderBackdrop () {
    const backdrop = new Backdrop({
      zIndex: 998,
      opacity: 0
    })
    this.listenTo(backdrop, 'click', () => {
      NavbarActions.toggleMenu()
    })
    this.on('change:menu_switch', () => {
      backdrop.visible = this.menu_switch
    })
  },
  setChartsLink () {
    if (!Acls.hasAccessLevel('user')) {
      return
    } else {
      var container = this.query('[data-hook=links-container] span.charts-link')

      const netbrainsConfig = App.state.session.customer.config.netbrains
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      // handle kibana config schema change
      const { kibana } = App.state.session.customer.config
      if (kibana && kibana.enabled && kibana.url) {
        container.appendChild(html2dom(`<li><a href="/admin/charts/kibana" class="eyemenu-ico eyemenu-charts"> Dashboard </a></li>`))
      }

      if (netbrainsConfig && netbrainsConfig.enabled) {
        container.appendChild(html2dom(`<li><a href="/admin/charts/netbrains" class="eyemenu-ico eyemenu-charts"> Netbrains </a></li>`))
      }
    }
  },
  renderMenuLinks () {
    const container = this.query('[data-hook=links-container] span.default-links')

    // empty container
    while (container.hasChildNodes()) {
      container.removeChild(container.lastChild)
    }

    if (App.state.session.user.credential) {
      if (Acls.hasAccessLevel('admin')) {
        container.appendChild(html2dom(`<li><a data-hook='mvc-link' href="/admin/monitor" class="eyemenu-icon eyemenu-monitors"> Monitors </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/task" class="eyemenu-icon eyemenu-tasks"> Tasks </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/file" class="eyemenu-icon eyemenu-scripts"> Files & Scripts </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/webhook" class="eyemenu-icon eyemenu-webhooks"> Webhooks </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/hostgroup" class="eyemenu-icon eyemenu-templates"> Templates </a></li>`))
      }

      if (Acls.hasAccessLevel('root')) {
        container.appendChild(html2dom(`<li><a href="/admin/user" class="eyemenu-icon eyemenu-users"> Users </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/customer" class="eyemenu-icon eyemenu-organizations"> Organizations </a></li>`))
      }
    }

    // on window resize recalculate links container height
    const recalculateLinksHeight = (event) => {
      const links = this.queryByHook('links-container')
      let height = window.innerHeight - 178
      if (window.innerWidth > 768) {
        height -= 75
      }
      links.style.height = String(height) + 'px'
    }

    const self = this
    window.addEventListener('resize', function (event) {
      recalculateLinksHeight.call(self, event)
    }, false)
    window.dispatchEvent(new window.Event('resize'))
  },
  renderProfile () {
    // in sync with the session
    const customer = new CurrentCustomerItem({
      el: this.queryByHook('session-customer'),
      active: true,
      model: App.state.session.customer
    })
    customer.render()
    this.registerSubview(customer)

    // in sync with the session
    const profile = new UserProfile({
      el: this.queryByHook('session-user'),
      model: App.state.session.user
    })
    profile.render()
    this.registerSubview(profile)

    // in sync with the session
    this.renderCollection(
      App.state.session.user.customers,
      CustomerItemList,
      this.queryByHook('customers-container')
    )

    // on window resize recalculate links container height
    const recalculateCustomersHeight = (event) => {
      const customers = this.queryByHook('customers-container')
      let height = window.innerHeight - 178
      if (window.innerWidth > 768) {
        height -= 75
      }

      customers.style.height = String(height) + 'px'
    }
    const self = this
    window.addEventListener('resize', function (event) {
      recalculateCustomersHeight.call(self, event)
    }, false)
    window.dispatchEvent(new window.Event('resize'))
  },
  renderSettingsMenu () {
    this.settings = new SettingsMenu()
    this.registerSubview(this.settings)
  }
})

module.exports = View.extend({
  autoRender: true,
  events: {
    'click a[data-hook=theeye-logo]': function (event) {
      if(App.state.session.logged_in)
        App.Router.navigate('dashboard')
      else
        window.location.href = 'https://theeye.io'
    }
  },
  template: () => {
    return template.call(this, { logo: logo })
  },
  render () {
    this.renderWithTemplate()

    this.listenToAndRun(App.state.session, 'change:logged_in', () => {
      this.updateState(App.state.session)
    })
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

    // menu
    this.menu = new Menu()
    this.renderSubview(
      this.menu,
      this.queryByHook('menu-container')
    )

    // notifications inbox
    this.inbox = new InboxView()
    this.renderSubview(
      this.inbox,
      this.queryByHook('buttons-container')
    )
  },
  destroyLoggedInComponents () {
    if (this.searchbox) this.searchbox.remove()
    if (this.menu) this.menu.remove()
    if (this.inbox) this.inbox.remove()
  }
})
