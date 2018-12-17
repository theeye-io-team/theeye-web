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
import html2dom from 'lib/html2dom'

import './settings.css'

const Content = View.extend({
  template: require('./template.hbs'),
})

module.exports = FullContainer.extend({
  template: `<div id="settings-container" class="full-page-container settings-container"></div>`,
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

      const credentialsTab = new CredentialsTab()
      this.renderSubview(credentialsTab, this.queryByHook('credentials-tab'))

      const integrationsTab = new IntegrationsTab({ model: App.state.session.customer })
      this.renderSubview(integrationsTab, this.queryByHook('integrations-tab'))
    }

    if (App.state.session.accountPreferences.showMembersTab) {
      if (Acls.hasAccessLevel('manager') && App.state.session.user.credential !=='admin') {
        settingsLinks.appendChild( html2dom(`<li class="tab-item"><a href="#members" data-toggle="tab">Members</a></li>`))

        const membersTab = new MembersTab()
        this.renderSubview(membersTab, this.queryByHook('members-tab'))
      }
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
    'click [data-hook=close-button]':'onClickCloseButton',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent',
    'click .tab-item': 'setCurrentTab'
  },
  onClickCloseButton (event) {
    event.preventDefault()
    event.stopPropagation()

    NavbarActions.hideSettingsMenu()
  },
  onKeyEvent (event) {
    if (event.keyCode == 27) {
      event.preventDefault()
      event.stopPropagation()

      NavbarActions.hideSettingsMenu()
    }
  },
  setCurrentTab (event) {
    NavbarActions.toggleTab(event.target.hash.substring(1))
  }
})
