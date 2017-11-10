import App from 'ampersand-app'
import NavbarActions from 'actions/navbar'
import View from 'ampersand-view'
import FullContainer from 'components/fullpagecontainer'
import InstallerTab from './installer'
import CredentialsTab from './credentials'
import AccountsTab from './accounts'
import MembersTab from './members'
import IntegrationsTab from './integrations'
import Acls from 'lib/acls'
import html2dom from 'lib/html2dom'

import './settings.css'

const Content = View.extend({
  template: require('./template.hbs'),
})

module.exports = FullContainer.extend({
  template: `<div class="full-page-container settings-container"></div>`,
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
  render() {
    FullContainer.prototype.render.apply(this,arguments)

    const linksContainer = this.queryByHook('links-container')
    const panesContainer = this.queryByHook('panes-container')

    if (Acls.hasAccessLevel('admin')) {
      linksContainer.appendChild( html2dom(`<li class="subtitle"><h3 class="blue">SETTINGS</h3></li>`))
      linksContainer.appendChild( html2dom(`<li class="tab-item"><a href="#installer" data-toggle="tab">Installer</a></li>`))
      linksContainer.appendChild( html2dom(`<li class="tab-item"><a href="#credentials" data-toggle="tab">Credentials</a></li>`))
      linksContainer.appendChild( html2dom(`<li class="tab-item"><a href="#integrations" data-toggle="tab">Integrations</a></li>`))

      this.installerTab = new InstallerTab()
      this.renderSubview(this.installerTab, this.queryByHook('installer-tab'))
      this.credentialsTab = new CredentialsTab()
      this.renderSubview(this.credentialsTab, this.queryByHook('credentials-tab'))
      this.integrationsTab = new IntegrationsTab({model: App.state.session.customer})
      this.renderSubview(this.integrationsTab, this.queryByHook('integrations-tab'))

      panesContainer.getElementsByClassName('installer-tab')[0].classList.add('in')
      panesContainer.getElementsByClassName('installer-tab')[0].classList.add('active')
    }

    if (Acls.hasAccessLevel('root')) {
      linksContainer.appendChild( html2dom(`<li class="tab-item"><a href="#members" data-toggle="tab">Members</a></li>`))

      this.membersTab = new MembersTab()
      this.renderSubview(this.membersTab, this.queryByHook('members-tab'))
    }

    linksContainer.appendChild( html2dom(`<li class="subtitle"><h3 class="orange">MY PROFILE</h3></li>`))
    linksContainer.appendChild( html2dom(`<li class="tab-item"><a href="#accounts" data-toggle="tab">Accounts</a></li>`))

    this.accountsTab = new AccountsTab()
    this.renderSubview(this.accountsTab, this.queryByHook('accounts-tab'))

    if (!Acls.hasAccessLevel('admin')) {
      panesContainer.getElementsByClassName('accounts-tab')[0].classList.add('in')
      panesContainer.getElementsByClassName('accounts-tab')[0].classList.add('active')
    }

    linksContainer.getElementsByClassName('tab-item')[0].classList.add('active')

    this.on('change:visible', () => {
      if (this.visible===true) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    })
  },
  updateState (state) {
    if (!state) return
    this.visible = state.visible
  },
  events: {
    'click [data-hook=close-button]':'onClickCloseButton',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent'
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
  }
})
