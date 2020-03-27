import App from 'ampersand-app'
import View from 'ampersand-view'
import SessionActions from 'actions/session'
import SideMenuActions from 'actions/sideMenu'
import Acls from 'lib/acls'
import html2dom from 'lib/html2dom'
import SettingsMenu from '../settings'

import './style.less'

const CustomerItemList = View.extend({
  props: {
    active: ['boolean', false, false],
    show: ['boolean', false, true]
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
    },
    show: {
      type: 'toggle'
    }
  },
  events: {
    'click a': 'onClickCustomer'
  },
  onClickCustomer (event) {
    event.preventDefault()
    // event.stopPropagation()
    SideMenuActions.clearCustomerSearch()
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
    <div class="eyemenu-secondary-users">
      <i data-hook="active" class="fa fa-user-circle active" aria-hidden="true"></i>
      <p data-hook="name" class="customer-name"></p>
    </div>
  `,
  bindings: {
    'model.name': {
      type: 'text',
      hook: 'name'
    }
  }
})

module.exports = View.extend({
  template: require('./menu.hbs'),
  props: {
    customers_switch: ['boolean', false, false],
    customerSearch: ['string', false, '']
  },
  bindings: {
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
    }],
    customerSearch: {
      type: 'value',
      hook: 'customers-input'
    }
  },
  events: {
    'click [data-hook=customers-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      SideMenuActions.clearCustomerSearch()
      this.toggle('customers_switch')
      return false
    },
    'click [data-hook=mvc-link]': function (event) {
      window.location.href = event.target.href
    },
    'input [data-hook=customers-input]': 'onSearchInput',
  },
  initialize () {
    this.listenToAndRun(App.state.navbar, 'change:menuSwitch', () => {
      this.customers_switch = false
    })

    this.listenToAndRun(App.state.session.customer, 'change:id', () => {
      if (!App.state.navbar.menuSwitch) {
        this.customers_switch = false
      }
    })

    this.listenToAndRun(App.state.sideMenu, 'change:customerSearch', () => {
        this.customerSearch = App.state.sideMenu.customerSearch
    })
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCustomers()
    this.listenToAndRun(App.state.session.user, 'change:credential', () => {
      this.renderMenuLinks()
    })
    this.listenToAndRun(App.state.session.customer, 'change:config', () => {
      this.setChartsLink()
    })
    this.renderSettingsMenu()
  },
  onSearchInput (event) {
    SideMenuActions.customerSearch(event.target.value)
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

    // // on window resize recalculate links container height
    // const recalculateLinksHeight = (event) => {
    //   const links = this.queryByHook('links-container')
    //   let height = window.innerHeight - 178
    //   if (window.innerWidth > 768) {
    //     height -= 75
    //   }
    //   links.style.height = String(height) + 'px'
    // }
    //
    // const self = this
    // window.addEventListener('resize', function (event) {
    //   recalculateLinksHeight.call(self, event)
    // }, false)
    // window.dispatchEvent(new window.Event('resize'))
  },
  renderCustomers () {
    // in sync with the session
    const customer = new CurrentCustomerItem({
      el: this.queryByHook('session-customer'),
      active: true,
      model: App.state.session.customer
    })
    customer.render()
    this.registerSubview(customer)

    // in sync with the session
    this.customersList = this.renderCollection(
      App.state.session.user.customers,
      CustomerItemList,
      this.queryByHook('customers-container')
    )

    this.customersListViews = this.customersList.views

    this.listenToAndRun(App.state.sideMenu, 'change:customerSearch', function () {
      this.filterViews(App.state.sideMenu.customerSearch)
    })

    // // on window resize recalculate links container height
    // const recalculateCustomersHeight = (event) => {
    //   const customers = this.queryByHook('customers-container')
    //   let height = window.innerHeight - 178
    //   if (window.innerWidth > 768) {
    //     height -= 75
    //   }
    //
    //   customers.style.height = String(height) + 'px'
    // }
    // const self = this
    // window.addEventListener('resize', function (event) {
    //   recalculateCustomersHeight.call(self, event)
    // }, false)
    // window.dispatchEvent(new window.Event('resize'))
  },
  filterViews (search) {
    const views = this.customersListViews
    search = search.toLowerCase()

    if (search.length < 3) {
      this.showAllViews()
      return
    }

    views.forEach((view) => {
      const name = view.model.name.toLowerCase()
      const hit = RegExp(search).test(name) === true
      if (hit) {
        view.show = true
      } else {
        view.show = false
      }
    })
  },
  showAllViews () {
    const views = this.customersListViews
    views.forEach((view) => {
      view.show = true
    })
  },
  renderSettingsMenu () {
    this.settings = new SettingsMenu()
    this.registerSubview(this.settings)
  },
  remove () {
    View.prototype.remove.apply()
    console.log("remove fired")
  }
})
