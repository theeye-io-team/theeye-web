import App from 'ampersand-app'
import View from 'ampersand-view'
import SimpleSwitch from 'components/simple-switch'
import SessionActions from 'actions/session'

export default View.extend({
  template: require('./template.hbs'),
  render () {
    this.renderWithTemplate(this)

    const notify = App.state.session.user.notifications
    this.renderSwitch('push', notify.push)
    //this.renderSwitch('mute', notify.mute)
    //this.renderSwitch('email', notify.email)
    this.renderSwitch('desktop', notify.desktop)
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
