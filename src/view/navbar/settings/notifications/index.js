import App from 'ampersand-app'
import View from 'ampersand-view'
import SimpleSwitch from 'components/simple-switch'
import SessionActions from 'actions/session'

export default View.extend({
  template: `
    <div class="tab-pane fade in">
      <h3 class="blue bold">NOTIFICATIONS</h3>

      <div class="row border">
        <div class="col-xs-4">
          <div class="check-container">
            <label for="check2">Mobile Notifications</label>
          </div>
        </div>
        <div class="col-xs-4">
          <small class="gray">Enable/Disable Mobile Notifications</small>
        </div>
        <div class="col-sm-4 text-right" data-hook="mobile"></div>
      </div>

      <div class="row border">
        <div class="col-xs-4">
          <div class="check-container">
            <label for="check2">Desktop Notifications</label>
          </div>
        </div>
        <div class="col-xs-4">
          <small class="gray">Enable/Disable Desktop Notifications</small>
        </div>
        <div class="col-sm-4 text-right" data-hook="desktop"></div>
      </div>

  `,
  render () {
    this.renderWithTemplate(this)

    const notify = App.state.session.user.notifications
    this.renderSwitch('mobile', notify.push)
    this.renderSwitch('desktop', notify.desktop)
    //this.renderSwitch('email', notify.email)
    //this.renderSwitch('mute', notify.mute)
  },
  renderSwitch (name, value) {
    const btn = new SimpleSwitch({ value: value || false })
    btn.on('change:value', () => {
      let settings = {}
      settings[name] = btn.value
      SessionActions.updateSettings(settings)
    })
    this.renderSubview(btn, this.queryByHook(name))
  }
})
