import App from 'ampersand-app'
import qs from 'qs'

import FullContainer from 'components/fullpagecontainer'

import Acls from 'lib/acls'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import html2dom from 'lib/html2dom'
import bootbox from 'bootbox'

// tabs
//import GroupsTab from './groups'
import RolesTab from './roles'
import MembersTab from './members'

import './styles.less'

export default FullContainer.extend({
  template: `
    <div data-component="iam-menu-container" class="full-page-container">
      <div class="iam-menu-page">
      <div class="header text-center">
        <span>Identity Access Management - <span data-hook="customer-view_name"></span></span>
        <span data-hook="close-button" class="close-button fa fa-remove" style=""></span>
      </div>
      <div class="col-xs-3 panel-left">
        <ul class="nav nav-tabs tabs-left" data-hook="iam-menu-links-container">
          <li class="tab-item"><a href="#members" data-toggle="tab">Members</a></li>
          <!--<li class="tab-item"><a href="#groups" data-toggle="tab">Groups</a></li>-->
          <li class="tab-item"><a href="#roles" data-toggle="tab">Roles</a></li>
        </ul>
      </div>
      <div class="col-xs-9 panel-right">
        <div class="tab-content" data-hook="panes-container">
          <div class="tab-pane fade" id="groups" data-hook="groups-tab"></div>
          <div class="tab-pane fade" id="roles" data-hook="roles-tab"></div>
          <div class="tab-pane fade" id="members" data-hook="members-tab"></div>
        </div>
      </div>
    </div>
  `,
  autoRender: true,
  props: {
    current_tab: ['string', false, 'members'],
    name: 'string'
  },
  remove () {
    FullContainer.prototype.remove.apply(this)
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

      const query = qs.parse(window.location.search, {ignoreQueryPrefix: true})
      query.tab = tab
      history.pushState(null, '', '?' + qs.stringify(query))
    })
  },
  events: {
    'click [data-hook=close-button]': 'onClickCloseButton',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent',
    'click .tab-item': 'setCurrentTab'
  },
  onClickCloseButton (event) {
    this.close(event)
  },
  onKeyEvent (event) {
    if (event.keyCode === 27) {
      this.close(event)
    }
  },
  close (event) {
    event.preventDefault()
    event.stopPropagation()
    this.remove()
    App.navigate('home')
    return false
  },
  setCurrentTab (event) {
    this.current_tab = event.target.hash.substring(1)
  },
  renderTabs () {
    //const groupsTab = new GroupsTab()
    //this.renderSubview(groupsTab, this.queryByHook('groups-tab'))

    const rolesTab = new RolesTab()
    this.renderSubview(rolesTab, this.queryByHook('roles-tab'))

    const membersTab = new MembersTab()
    this.renderSubview(membersTab, this.queryByHook('members-tab'))

    this.listenToAndRun(App.state.session.customer, 'change:view_name', () => {
      this.queryByHook('customer-view_name').innerHTML = App.state.session.customer.view_name
    })
  }
})
