import App from 'ampersand-app'
import View from 'ampersand-view'
import SideMenuActions from 'actions/sideMenu'
import Acls from 'lib/acls'
import html2dom from 'lib/html2dom'

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
            <div>
              <li><a href="/dashboard" class="eyeicon eyemenu-icon eyeicon-dashboard">Home</a></li>
            </div>
            <div data-hook="core-links"></div>
            <div>
              <li><a href="/help" class="eyeicon eyemenu-icon eyeicon-help">Help</a></li>
            </div>
            <div data-hook="integration-links" class="integrations-links">
              <section></section>
              </div>
          </ul>
          <!-- } END LINKS CONTAINER -->
        </div>
      </div>
    `
    return html
  },
  props: {
    customers_switch: ['boolean', false, false],
    customerSearch: ['string', false, ''],
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
    'mouseenter [data-hook=menu]': function () {
      this.trigger('mouseenter')
    },
    'mouseleave [data-hook=menu]': function () {
      this.trigger('mouseleave')
    }
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

    //this.listenToAndRun(App.state.session.customer, 'change:config', () => {
    //  this.updateState({ config: App.state.session.customer.config })
    //})

    //this.renderIntegrationLinks()
  },
  //updateState ({ config }) {
  //  const keys = Object.keys(config)
  //  if (keys.length > 0) {
  //    this.integrations.reset()

  //    for (let name in config) {
  //      const settings = Object.assign({name},config[name])
  //      if (settings?.menu === true) {
  //        this.integrations.add(new Integration(settings))
  //      }
  //    }
  //  }
  //},
  onSearchInput (event) {
    SideMenuActions.customerSearch(event.target.value)
  },
  renderIntegrationLinks () {
    const container = this.query('[data-hook=integration-links]')
    this.renderCollection(
      App.state.session.customer.config.integrations,
      MenuItem,
      container
    )
  },
  renderMenuLinks () {
    const container = this.query('[data-hook=core-links]')

    // empty container
    while (container.hasChildNodes()) {
      container.removeChild(container.lastChild)
    }

    if (App.state.session.user.credential) {
      if (Acls.hasAccessLevel('admin')) {
        container.appendChild(html2dom(`<li><a href="/admin/task" class="eyeicon eyemenu-icon eyeicon-tasks">Tasks</a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/file" class="eyeicon eyemenu-icon eyeicon-scripts">Files & Scripts</a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/webhook" class="eyeicon eyemenu-icon eyeicon-webhooks">Webhooks</a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/hostgroup" class="eyeicon eyemenu-icon eyeicon-templates">Templates</a></li>`))
      }

      if (Acls.hasAccessLevel('manager')) {
        let link = html2dom(`<li><a href="" data-hook="settings-menu" class="eyeicon eyemenu-icon eyeicon-settings">Settings</a></li>`)
        link.onclick = () => {
          App.actions.settingsMenu.show('customer')
        }
        container.appendChild(link)
      }

      if (Acls.hasAccessLevel('root')) {
        container.appendChild(html2dom(`<li><a href="/admin/user" class="eyeicon eyemenu-icon eyeicon-users">Users</a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/customer" class="eyeicon eyemenu-icon eyeicon-organizations">Organizations</a></li>`))
        container.appendChild(html2dom(`<li><a href="/admin/member" class="eyeicon eyemenu-icon eyeicon-users">Members</a></li>`))
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

const MenuItem = View.extend({
  template: `
    <li>
      <a href="#" class="" target="_blank">
        <i style="" class=""></i>
        <span></span>
      </a>
    </li>
  `,
  bindings: {
    'model.icon': {
      selector: 'a > i',
      type: 'attribute',
      name: 'class'
    },
    'model.url': {
      selector: 'a',
      type: 'attribute',
      name: 'href'
    },
    'model.class': {
      selector: 'a',
      type: 'attribute',
      name: 'class'
    },
    'model.label': {
      selector: 'a > span'
    }
  }
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
