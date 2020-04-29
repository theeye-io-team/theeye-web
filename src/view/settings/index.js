import App from 'ampersand-app'
import NavbarActions from 'actions/navbar'
import View from 'ampersand-view'
import FullContainer from 'components/fullpagecontainer'
import InstallerTab from './installer'
import CredentialsTab from './credentials'
import AccountsTab from './accounts'
import MembersTab from './members'
import NotificationsTab from './notifications'
import IntegrationsTab from './integrations'
import Acls from 'lib/acls'
import OnboardingActions from 'actions/onboarding'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import html2dom from 'lib/html2dom'
import bootbox from 'bootbox'
import './settings.less'

module.exports = FullContainer.extend({
  template: `<div data-component="settings-container" class="full-page-container"></div>`,
  autoRender: true,
  props: {
    visible: ['boolean',false,false]
  },
  bindings: {
    visible: { type: 'toggle' }
  },
  initialize () {
    FullContainer.prototype.initialize.apply(this,arguments)

    this.autoAppend = true
    this.content = new Content()

    this.listenToAndRun(App.state.navbar.settingsMenu,'change',() => {
      this.updateState(App.state.navbar.settingsMenu)
    })
  },
  render () {
    FullContainer.prototype.render.apply(this,arguments)

    const settingsLinks = this.queryByHook('settings-links-container')

    const accountsTab = new AccountsTab()
    this.renderSubview(accountsTab, this.queryByHook('accounts-tab'))

    const notificationsTab = new NotificationsTab()
    this.renderSubview(notificationsTab, this.queryByHook('notifications-tab'))

    if (Acls.hasAccessLevel('manager')) {
      settingsLinks.appendChild( html2dom(`<li class="subtitle"><h3 class="blue">SETTINGS</h3></li>`))
    }

    if (Acls.hasAccessLevel('admin')) {
      settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#installer" data-toggle="tab">Installer</a></li>`))
      settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#credentials" data-toggle="tab">Credentials</a></li>`))
      settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#integrations" data-toggle="tab">Integrations</a></li>`))

      const installerTab = new InstallerTab()
      this.renderSubview(installerTab, this.queryByHook('installer-tab'))

      settingsLinks.appendChild( html2dom(`<li data-hook="start-tutorial"><a href="#">Tutorial</a></li>`))

      const credentialsTab = new CredentialsTab()
      this.renderSubview(credentialsTab, this.queryByHook('credentials-tab'))

      const integrationsTab = new IntegrationsTab({ model: App.state.session.customer })
      this.renderSubview(integrationsTab, this.queryByHook('integrations-tab'))
    }

    if (Acls.hasAccessLevel('manager') && App.state.session.user.credential !=='admin') {
      settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#members" data-toggle="tab">Members</a></li>`))

      const membersTab = new MembersTab()
      this.renderSubview(membersTab, this.queryByHook('members-tab'))
    }

    this.on('change:visible', () => {
      if (this.visible===true) {
        window.scrollTo(0,0)
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    })

    this.listenToAndRun(App.state.session.customer,'change:name', () => {
      this.queryByHook('customer-name').innerHTML = App.state.session.customer.name
    })

    this.listenTo(App.state.navbar.settingsMenu,'change:current_tab', () => {
      let selector = `[data-hook=settings-links-container] a[href="#${App.state.navbar.settingsMenu.current_tab}"]`
      $( this.query(selector) ).tab('show')
    })
  },
  updateState (state) {
    if (!state) return

    this.visible = state.visible
  },
  events: {
    'click [data-hook=close-button]': 'onClickCloseButton',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent',
    'click .tab-item': 'setCurrentTab',
    'click [data-hook=start-tutorial]': 'onClickTutorial'
  },
  onClickCloseButton (event) {
    event.preventDefault()
    event.stopPropagation()

    NavbarActions.hideSettingsMenu()
  },
  onClickTutorial (event) {
    event.preventDefault()
    event.stopPropagation()

    // if user has bots and tasks, show tutorial options
    if (App.state.resources.length > 0 && App.state.tasks.length > 0) {
      bootbox.dialog({
        title: 'Tutorial',
        message: 'Which tutorial would you like to see?',
        closeButton: true,
        buttons: {
          self_provided: {
            label: 'Bot tutorial',
            className: 'btn-primary',
            callback () {
              OnboardingActions.showOnboarding()
              NavbarActions.toggleTab('installer')
            }
          },
          linux: {
            label: 'Task tutorial',
            className: 'btn-primary',
            callback () {
              OnboardingActions.showOnboarding()
              NavbarActions.hideSettingsMenu()
              let wizard = new TaskCreationWizard()
            }
          }
        }
      })
    } else {
      // if the user doesn't have bots or tasks, show the corresponding tutorial
      OnboardingActions.showOnboarding()
      if (App.state.resources.length === 0) {
        NavbarActions.toggleTab('installer')
      } else {
        NavbarActions.hideSettingsMenu()
        let wizard = new TaskCreationWizard()
      }
    }
  },
  onKeyEvent (event) {
    if (event.keyCode === 27) {
      event.preventDefault()
      event.stopPropagation()

      NavbarActions.hideSettingsMenu()
    }
  },
  setCurrentTab (event) {
    NavbarActions.toggleTab(event.target.hash.substring(1))
  }
})

const Content = View.extend({
  template: require('./template.hbs'),
})
