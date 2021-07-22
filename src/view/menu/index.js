import App from 'ampersand-app'
import View from 'ampersand-view'
import SideMenuActions from 'actions/sideMenu'
import Acls from 'lib/acls'
import html2dom from 'lib/html2dom'
import CustomerSettings from 'view/settings/customer'

import './style.less'

export default View.extend({
  template () {
    let html = `
      <div data-hook="menu" class="eyemenu-panel eyemenu-panel-left">
        <!-- PROFILE MENU HEADER { -->
        <div data-hook="profile-container" class="eyemenu-top-panel">
          <div data-hook="customers-toggle" class="pointer">
            <div data-hook="session-customer"></div>
            
            <div class="eyemenu-switch-panels">
              <i class="fa fa-angle-down" aria-hidden="true"></i>
            </div>
          </div>
        </div>
        <!-- } END PROFILE MENU HEADER -->
        <div class="eyemenu-bot-panel">
          <ul data-hook="customers-container" class="eyemenu-links eyemenu-clients">
            <div class="customers-search">
              <i class="fa fa-search" aria-hidden="true"></i>
              <input autocomplete="off" data-hook="customers-input" class="customers-input" placeholder="Search">
            </div>
          </ul>
          <!-- LINKS CONTAINER { -->
          <ul data-hook="links-container" class="eyemenu-links eyemenu-actions">
            <li><a href="/dashboard" class="eyemenu-icon eyemenu-dashboard"> Home </a></li>
            <span class="charts-link"></span>
            <span class="default-links"></span>
            <li><a href="/help" class="eyemenu-icon eyemenu-help"> Help </a></li>
          </ul>
          <!-- } END LINKS CONTAINER -->
        </div>
      </div>
    `
    return html
  },
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

      this.queryByHook('customers-input').focus()
      return false
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

    this.registerSubview(new CustomerSettings())

    this.listenToAndRun(App.state.session.user, 'change:credential', () => {
      this.renderMenuLinks()
    })

    this.listenToAndRun(App.state.session.customer, 'change:config', () => {
      this.setChartsLink()
    })
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
        container.appendChild(html2dom(`<li><a href="/admin/file" class="eyemenu-icon eyemenu-scripts"> Files & Scripts </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/webhook" class="eyemenu-icon eyemenu-webhooks"> Webhooks </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/hostgroup" class="eyemenu-icon eyemenu-templates"> Templates </a></li>`))
      }

      if (Acls.hasAccessLevel('manager')) {
        let link = html2dom(`<li><a href="" data-hook="settings-menu" class="eyemenu-icon eyemenu-settings"> Settings </a></li>`)
        link.onclick = () => App.actions.settingsMenu.show('customer')
        container.appendChild(link)
      }

      if (Acls.hasAccessLevel('root')) {
        container.appendChild(html2dom(`<li><a href="/admin/user" class="eyemenu-icon eyemenu-users"> Users </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/customer" class="eyemenu-icon eyemenu-organizations"> Organizations </a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/member" class="eyemenu-icon eyemenu-users"> Members </a></li>`))
      }
    }
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
      App.state.session.customers,
      CustomerItemList,
      this.queryByHook('customers-container')
    )

    this.listenToAndRun(App.state.sideMenu, 'change:customerSearch', function () {
      this.filterViews(App.state.sideMenu.customerSearch)
    })
  },
  filterViews (search) {
    if (search.length < 3) {
      this.showAllViews()
      return
    }

    const searchPattern = new RegExp(search,'i')

    this.customersList.views.forEach(view => {
      const model = view.model

      view.show = (
        searchPattern.test(model.name) === true ||
        searchPattern.test(model.display_name) === true
      )
    })
  },
  showAllViews () {
    this.customersList.views.forEach(view => view.show = true)
  },
})

const CustomerItemList = View.extend({
  props: {
    active: ['boolean', false, false],
    show: ['boolean', false, true]
  },
  template: `
    <li data-hook="active" class="eyemenu-client">
      <a href="#">
        <i class="fa fa-user-circle" aria-hidden="true"></i>
        <span data-hook="view_name"></span>
      </a>
    </li>
  `,
  bindings: {
    'model.view_name': {
      type: 'text',
      hook: 'view_name'
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
    'click a': 'onClickCustomer',
  },
  onClickCustomer (event) {
    event.preventDefault()
    // event.stopPropagation()
    SideMenuActions.clearCustomerSearch()
    App.actions.session.changeCustomer(this.model.id)
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
      <p data-hook="view_name" class="customer-name"></p>
    </div>
  `,
  bindings: {
    'model.view_name': {
      type: 'text',
      hook: 'view_name'
    }
  }
})
