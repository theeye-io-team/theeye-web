import View from 'ampersand-view'
import Searchbox from './searchbox'
import SessionActions from 'actions/session'
import Acls from 'lib/acls'
import html2dom from 'lib/html2dom'

const CustomerItemList = View.extend({
  props: {
    active: ['boolean',false,false]
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
    event.stopPropagation()

    App.state.loader.visible = true
    SessionActions.setCustomer( this.model.name )
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

export default View.extend({
  template: require('./nav.hbs'),
  props: {
    menu_switch: ['boolean',false,false],
    customers_switch: ['boolean',false,false]
  },
  bindings: {
    menu_switch: {
      type: 'toggle',
      hook: 'menu-container'
    },
    customers_switch: [{
      type: 'toggle',
      hook: 'customers-container'
    },{
      type: 'toggle',
      hook: 'links-container',
      invert: true
    },{
      type: 'booleanClass',
      selector: '[data-hook=customers-toggle] i.fa',
      yes: 'fa-angle-up',
      no: 'fa-angle-down',
    }]
  },
  events: {
    'click [data-hook=menu-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()

      this.toggle('menu_switch')

      return false
    },
    'click [data-hook=customers-toggle]': function (event) {
      event.preventDefault()
      event.stopPropagation()

      this.toggle('customers_switch')

      return false
    }
  },
  render () {
    this.renderWithTemplate()

    this.renderSearchbox()
    this.renderCustomers()
    this.renderMenuLinks()
  },
  renderMenuLinks () {
    const container = this.query('[data-hook=links-container] span')
    if ( Acls.hasAccessLevel('admin') ) {
      container.appendChild( html2dom(`<li><a href="/admin/monitor" class="eyemenu-icon eyemenu-monitors"> Monitors </a></li>`))
      container.appendChild( html2dom(`<li><a href="/admin/task" class="eyemenu-icon eyemenu-tasks"> Tasks </a></li>`))
      container.appendChild( html2dom(`<li><a href="/admin/webhook" class="eyemenu-icon eyemenu-webhooks"> Webhooks </a></li>`))
      container.appendChild( html2dom(`<li><a href="/admin/script" class="eyemenu-icon eyemenu-scripts"> Scripts </a></li>`))
      container.appendChild( html2dom(`<li><a href="/admin/hostgroup" class="eyemenu-icon eyemenu-templates"> Provisioning </a></li>`))
    }

    if ( Acls.hasAccessLevel('root') ) {
      container.appendChild( html2dom(`<li><a href="/admin/user" class="eyemenu-icon eyemenu-users"> Users </a></li>`))
      container.appendChild( html2dom(`<li><a href="/admin/customer" class="eyemenu-icon eyemenu-organizations"> Organizations </a></li>`))
    }

    // on window resize recalculate links container height
    const recalculateLinksHeight = (event) => {
      const links = this.queryByHook('links-container')
      let height = window.innerHeight - 178
      if (window.innerWidth>768) {
        height -= 75
      }
      links.style.height = String(height) + "px"
    }

    const self = this
    window.addEventListener('resize',function(event){
      recalculateLinksHeight.call(self,event)
    },false)
    window.dispatchEvent(new Event('resize'))
  },
  renderSearchbox () {
    this.searchbox = new Searchbox({
      el: this.queryByHook('searchbox-container')
    })
    this.searchbox.render()
    this.registerSubview( this.searchbox )
  },
  renderCustomers () {
    const customer = new CurrentCustomerItem({
      el: this.queryByHook('session-customer'),
      active: true,
      model: App.state.session.customer
    })
    customer.render()
    this.registerSubview(customer)

    const profile = new UserProfile({
      el: this.queryByHook('session-user'),
      model: App.state.session.user
    })
    profile.render()
    this.registerSubview(profile)

    this.renderCollection(
      App.state.session.user.customers,
      function (options) {
        if (options.model.id===App.state.session.customer.id) {
          options.active = true
        }
        return new CustomerItemList(options)
      },
      this.queryByHook('customers-container')
    )

    // on window resize recalculate links container height
    const recalculateCustomersHeight = (event) => {
      const customers = this.queryByHook('customers-container')
      let height = window.innerHeight - 178
      if (window.innerWidth>768) {
        height -= 75
      }

      customers.style.height = String(height) + "px"
    }
    const self = this
    window.addEventListener('resize',function(event){
      recalculateCustomersHeight.call(self,event)
    },false)
    window.dispatchEvent(new Event('resize'))
  }
})
