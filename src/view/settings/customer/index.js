import App from 'ampersand-app'
import View from 'ampersand-view'

import Acls from 'lib/acls'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import html2dom from 'lib/html2dom'
import bootbox from 'bootbox'

// tabs
import InstallerTab from './installer'
import CredentialsTab from './credentials'
import MembersTab from './members'
import IntegrationsTab from './integrations'

import Settings from '../settings'

export default Settings.extend({
  initialize () {
    Settings.prototype.initialize.apply(this,arguments)
    this.listenToAndRun(App.state.settingsMenu.customer,'change',() => {
      this.updateState(App.state.settingsMenu.customer)
    })
    this.name = 'customer'
    this.content = new Content()
  },
  renderTabs () {

    this.on('change:visible', () => {
      if (this.visible === false) {
        this.remove()
      }
    })
    const settingsLinks = this.queryByHook('settings-links-container')

    if (Acls.hasAccessLevel('manager')) {
      settingsLinks.appendChild( html2dom(`<li class="subtitle"><h3 class="blue">SETTINGS</h3></li>`))
    }

    this.listenToAndRun(App.state.session.user, 'change:credential', () => {
      let hook = this.queryByHook('members-tab')
      if (
        App.state.session.user.credential === 'manager' ||
        App.state.session.user.credential === 'owner' ||
        App.state.session.user.credential === 'root'
      ) {
        // already rendered view?
        if (!this.membersTab) {
          let elem = html2dom(`<li data-hook="members-tab-link" class="tab-item"><a href="#members" data-toggle="tab">Members</a></li>`)
          settingsLinks.appendChild(elem)
          this.membersTab = new MembersTab()
        }
        this.renderSubview(this.membersTab, this.queryByHook('members-tab'))
      } else {
        if (this.membersTab) {
          this.membersTab.remove()
          let link = this.queryByHook('members-tab-link')
          if (link) { link.remove() }
        }
      }
    })

    if (Acls.hasAccessLevel('admin')) {
      settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#installer" data-toggle="tab">Installer</a></li>`))
      settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#credentials" data-toggle="tab">Credentials</a></li>`))
      settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#integrations" data-toggle="tab">Integrations</a></li>`))

      const installerTab = new InstallerTab()
      this.renderSubview(installerTab, this.queryByHook('installer-tab'))

      const credentialsTab = new CredentialsTab()
      this.renderSubview(credentialsTab, this.queryByHook('credentials-tab'))

      const integrationsTab = new IntegrationsTab({ model: App.state.session.customer })
      this.renderSubview(integrationsTab, this.queryByHook('integrations-tab'))

      settingsLinks.appendChild( html2dom(`<li data-hook="start-tutorial"><a href="#">Tutorial</a></li>`))
    }

    this.listenToAndRun(App.state.session.customer, 'change:view_name', () => {
      this.queryByHook('customer-view_name').innerHTML = App.state.session.customer.view_name
    })
  },
  events: Object.assign({}, Settings.prototype.events, {
    'click [data-hook=start-tutorial]':'onClickTutorial'
  }),
  onClickTutorial (event) {
    event.preventDefault()
    event.stopPropagation()

    // if user has bots and tasks, show tutorial options
    if (App.state.resources.length > 0 && App.state.tasks.length > 0) {
      bootbox.dialog({
        title: 'Tutorial',
        message: 'Which tutorial would you like to see?',
        closeButton: false,
        buttons: {
          bot: {
            label: 'Bot tutorial',
            className: 'btn-primary',
            callback () {
              App.actions.onboarding.activateOnboarding(true)
              App.actions.settingsMenu.toggleTab('customer','installer')
            }
          },
          task: {
            label: 'Task tutorial',
            className: 'btn-primary',
            callback () {
              App.actions.settingsMenu.hide('customer')
              App.actions.onboarding.activateOnboarding(true)
              let wizard = new TaskCreationWizard()
            }
          },
          cancel: {
            label: 'Cancel',
            className: 'btn-light',
            callback () {
              App.actions.onboarding.hideOnboarding()
            }
          }
        }
      })
    } else {
      // if the user doesn't have bots or tasks, show the corresponding tutorial
      if (App.state.resources.length === 0) {
        App.actions.onboarding.activateOnboarding(true)
        App.actions.settingsMenu.toggleTab('customer','installer')
      } else {
        App.actions.settingsMenu.hide('customer')
        App.actions.onboarding.activateOnboarding(true)
        let wizard = new TaskCreationWizard()
      }
    }
  }
})

const Content = View.extend({
  template: () => {
    let html = `
      <div class="settings-page">
        <div class="header text-center">
          <span>Your preferences for <span data-hook="customer-view_name"></span></span>
          <span data-hook="close-button" class="close-button fa fa-remove" style=""></span>
        </div>
        <div class="panel-left">
          <ul class="nav nav-tabs tabs-left" data-hook="settings-links-container">
          </ul>
        </div>
        <div class="panel-right">
          <div class="tab-content" data-hook="panes-container">
            <div class="tab-pane fade" id="installer" data-hook="installer-tab"></div>
            <div class="tab-pane fade" id="credentials" data-hook="credentials-tab"></div>
            <div class="tab-pane fade" id="members" data-hook="members-tab"></div>
            <div class="tab-pane fade" id="integrations" data-hook="integrations-tab"></div>
          </div>
        </div>
      </div>
    `

    return html
  }
})
