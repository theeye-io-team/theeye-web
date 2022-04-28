import App from 'ampersand-app'

import FullContainer from 'components/fullpagecontainer'

import Acls from 'lib/acls'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import html2dom from 'lib/html2dom'
import bootbox from 'bootbox'

// tabs
import GroupsTab from './groups'

import PolicyTab from './policies'
import MembersTab from './members'

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
        </ul>
      </div>
      <div class="col-xs-9 panel-right">
        <div class="tab-content" data-hook="panes-container">
          <div class="tab-pane fade" id="groups" data-hook="groups-tab"></div>
          <div class="tab-pane fade" id="policies" data-hook="policy-tab"></div>
          <div class="tab-pane fade" id="members" data-hook="members-tab"></div>
        </div>
      </div>
    </div>
  `,
  autoRender: true,
  props: {
    visible: ['boolean',false,false],
    current_tab: 'string',
    name: 'string'
  },
  bindings: {
    visible: { type: 'toggle' }
  },
  initialize () {
    FullContainer.prototype.initialize.apply(this,arguments)
    this.autoAppend = true
    this.listenToAndRun(App.state.iamMenu,'change',() => {
      this.updateState(App.state.iamMenu)
    })
    this.name = 'customer'
  },
  render () {
    FullContainer.prototype.render.apply(this,arguments)

    this.on('change:visible', () => {
      if (this.visible === true) {
        window.scrollTo(0,0)
        document.body.style.overflow = 'hidden'
      } else {
        App.state.groups.fetch()
        document.body.style.overflow = 'auto'
      }
    })

    this.renderTabs()

    this.on('change:current_tab', () => {
      let tab = this.current_tab
      let selector = `[data-hook=iam-menu-links-container] a[href="#${tab}"]`
      $( this.query(selector) ).tab('show')
    })
  },
  updateState (state) {
    if (!state) { return }
    this.visible = state.visible
    this.current_tab = state.current_tab
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
    App.actions.iamMenu.hide()
    return false
  },
  onKeyEvent (event) {
    if (event.keyCode === 27) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.iamMenu.hide()
      return false
    }
  },
  setCurrentTab (event) {
    App.actions.iamMenu.toggleTab(event.target.hash.substring(1))
  },
  renderTabs () {
    const groupsLinks = this.queryByHook('iam-menu-links-container')

    if (Acls.hasAccessLevel('admin')) {
      groupsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#groups" data-toggle="tab">Groups</a></li>`))
      groupsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#policies" data-toggle="tab">Policies</a></li>`))
      groupsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#members" data-toggle="tab">Members</a></li>`))

      const groupsTab = new GroupsTab()
      this.renderSubview(groupsTab, this.queryByHook('groups-tab'))

      const policyTab = new PolicyTab()
      this.renderSubview(policyTab, this.queryByHook('policy-tab'))

      const membersTab = new MembersTab()
      this.renderSubview(membersTab, this.queryByHook('members-tab'))
    }

    // this.listenToAndRun(App.state.session.user, 'change:credential', () => {
    //   let hook = this.queryByHook('members-tab')
    //   if (
    //     App.state.session.user.credential === 'manager' ||
    //     App.state.session.user.credential === 'owner' ||
    //     App.state.session.user.credential === 'root'
    //   ) {
    //     // already rendered view?
    //     if (!this.membersTab) {
    //       let elem = html2dom(`<li data-hook="members-tab-link" class="tab-item"><a href="#members" data-toggle="tab">Members</a></li>`)
    //       settingsLinks.appendChild(elem)
    //       this.membersTab = new MembersTab()
    //     }
    //     this.renderSubview(this.membersTab, this.queryByHook('members-tab'))
    //   } else {
    //     if (this.membersTab) {
    //       this.membersTab.remove()
    //       let link = this.queryByHook('members-tab-link')
    //       if (link) { link.remove() }
    //     }
    //   }
    // })

    this.listenToAndRun(App.state.session.customer, 'change:view_name', () => {
      this.queryByHook('customer-view_name').innerHTML = App.state.session.customer.view_name
    })
  },
  // events: Object.assign({}, Settings.prototype.events, {
  //   'click [data-hook=start-tutorial]':'onClickTutorial'
  // }),
  // onClickTutorial (event) {
  //   event.preventDefault()
  //   event.stopPropagation()

  //   // if user has bots and tasks, show tutorial options
  //   if (App.state.resources.length > 0 && App.state.tasks.length > 0) {
  //     bootbox.dialog({
  //       title: 'Tutorial',
  //       message: 'Which tutorial would you like to see?',
  //       closeButton: false,
  //       buttons: {
  //         self_provided: {
  //           label: 'Bot tutorial',
  //           className: 'btn-primary',
  //           callback () {
  //             App.actions.onboarding.activateOnboarding(true)
  //             App.actions.settingsMenu.toggleTab('customer','installer')
  //           }
  //         },
  //         linux: {
  //           label: 'Task tutorial',
  //           className: 'btn-primary',
  //           callback () {
  //             App.actions.settingsMenu.hide('customer')
  //             App.actions.onboarding.activateOnboarding(true)
  //             let wizard = new TaskCreationWizard()
  //           }
  //         },
  //         cancel: {
  //           label: 'Cancel',
  //           className: 'btn-light',
  //           callback () {
  //             App.actions.onboarding.hideOnboarding()
  //           }
  //         }
  //       }
  //     })
  //   } else {
  //     // if the user doesn't have bots or tasks, show the corresponding tutorial
  //     App.actions.onboarding.activateOnboarding(true)
  //     if (App.state.resources.length === 0) {
  //       App.actions.settingsMenu.toggleTab('customer','installer')
  //     } else {
  //       App.actions.settingsMenu.hide('customer')
  //       let wizard = new TaskCreationWizard()
  //     }
  //   }
  // }
})