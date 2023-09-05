import App from 'ampersand-app'
import View from 'ampersand-view'
import AccountsTab from './accounts'
import NotificationsTab from './notifications'
import Settings from '../settings'

export default Settings.extend({
  initialize () {
    Settings.prototype.initialize.apply(this,arguments)
    this.listenToAndRun(App.state.settingsMenu.user,'change',() => {
      this.updateState(App.state.settingsMenu.user)
    })
    this.name = 'user'
    this.content = new Content()
  },
  renderTabs () {
    this.on('change:visible', () => {
      if (this.visible === false) {
        this.remove()
      }
    })
    const accountsTab = new AccountsTab()
    this.renderSubview(accountsTab, this.queryByHook('accounts-tab'))

    const notificationsTab = new NotificationsTab()
    this.renderSubview(notificationsTab, this.queryByHook('notifications-tab'))
  }
})

const Content = View.extend({
  template: () => {
    let html = `
      <div class="settings-page">
        <div class="header text-center">
          <span>Your profile preferences</span>
          <span data-hook="close-button" class="close-button fa fa-remove" style=""></span>
        </div>
        <div class="panel-left">
          <ul class="nav nav-tabs tabs-left" data-hook="settings-links-container">
            <li class="subtitle"><h3 class="orange">MY PROFILE</h3></li>
            <li class="tab-item"><a href="#accounts" data-toggle="tab">Accounts</a></li>
            <li class="tab-item"><a href="#notifications" data-toggle="tab">Notifications</a></li>
          </ul>
        </div>
        <div class="panel-right">
          <div class="tab-content" data-hook="panes-container">
            <div class="tab-pane fade" id="accounts" data-hook="accounts-tab"></div>
            <div class="tab-pane fade" id="notifications" data-hook="notifications-tab"></div>
          </div>
        </div>
      </div>
    `
    return html
  }
})
