import App from 'ampersand-app'

import FullContainer from 'components/fullpagecontainer'

import Acls from 'lib/acls'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import html2dom from 'lib/html2dom'
import bootbox from 'bootbox'

// tabs
import GroupsTab from './groups'
import PolicyTab from './policies'
import UsersTab from './users'

import './styes.less'

export default FullContainer.extend({
  template: `
    <div data-component="iam-menu-container" class="full-page-container">
      <div class="iam-menu-page">
      <div class="header text-center">
        <span>Your groups in <span data-hook="customer-view_name"></span></span>
        <span data-hook="close-button" class="close-button fa fa-remove" style=""></span>
      </div>
      <div class="col-xs-3 panel-left">
        <ul class="nav nav-tabs tabs-left" data-hook="iam-menu-links-container">
          <li class="tab-item"><a href="#groups" data-toggle="tab">Groups</a></li>
          <li class="tab-item"><a href="#policies" data-toggle="tab">Roles</a></li>
          <li class="tab-item"><a href="#users" data-toggle="tab">Users</a></li>
        </ul>
      </div>
      <div class="col-xs-9 panel-right">
        <div class="tab-content" data-hook="panes-container">
          <div class="tab-pane fade" id="groups" data-hook="groups-tab"></div>
          <div class="tab-pane fade" id="policies" data-hook="policy-tab"></div>
          <div class="tab-pane fade" id="users" data-hook="users-tab"></div>
        </div>
      </div>
    </div>
  `,
  autoRender: true,
  props: {
    current_tab: ['string',false, 'groups'],
    name: 'string'
  },
  bindings: {
  },
  initialize () {
    FullContainer.prototype.initialize.apply(this,arguments)
    this.autoAppend = true
    this.name = 'customer'
  },
  render () {
    FullContainer.prototype.render.apply(this,arguments)
    window.scrollTo(0,0)
    document.body.style.overflow = 'auto'

    this.renderTabs()

    this.listenToAndRun(this, 'change:current_tab', () => {
      let tab = this.current_tab
      let selector = `[data-hook=iam-menu-links-container] a[href="#${tab}"]`
      $( this.query(selector) ).tab('show')
    })
  },
  events: {
    'click [data-hook=close-button]': 'onClickCloseButton',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent',
    'click .tab-item': 'setCurrentTab'
  },
  onClickCloseButton (event) {
    event.preventDefault()
    event.stopPropagation()
    this.remove()
    App.navigate('home')
    return false
  },
  onKeyEvent (event) {
    if (event.keyCode === 27) {
      event.preventDefault()
      event.stopPropagation()
      this.remove()
      return false
    }
  },
  setCurrentTab (event) {
    this.current_tab = event.target.hash.substring(1)
  },
  renderTabs () {
    const groupsTab = new GroupsTab()
    this.renderSubview(groupsTab, this.queryByHook('groups-tab'))

    const policyTab = new PolicyTab()
    this.renderSubview(policyTab, this.queryByHook('policy-tab'))

    const usersTab = new UsersTab()
    this.renderSubview(usersTab, this.queryByHook('users-tab'))

    this.listenToAndRun(App.state.session.customer, 'change:view_name', () => {
      this.queryByHook('customer-view_name').innerHTML = App.state.session.customer.view_name
    })
  }
})
