import App from 'ampersand-app'
import View from 'ampersand-view'
import SimpleSwitch from 'components/simple-switch'
import SessionActions from 'actions/session'

export default View.extend({
  template: require('./template.hbs'),
  //template: `
  //  <div>
  //    <h4 class="blue">
  //      <i class="fa fa-bell"></i>
  //      Notifications
  //    </h4>
  //    <div class="row">
  //      <div class="col-sm-6"> Email </div>
  //      <div class="col-sm-6 text-right" data-hook="email-switch"></div>
  //    </div>
  //    <div class="row">
  //      <div class="col-sm-6"> Push </div>
  //      <div class="col-sm-6 text-right" data-hook="push-switch"></div>
  //    </div>
  //  </div>`,
  render () {
    this.renderWithTemplate(this)
    const state = App.state.session.user.notifications

    const emailSwitch = new SimpleSwitch({
      value: state.email,
      onChange: (state, value) => {
        SessionActions.updateSettings({ email: value })
      }
    })
    this.renderSubview(emailSwitch, this.queryByHook('email-switch'))

    const pushSwitch = new SimpleSwitch({
      value: state.push,
      onChange: (state, value) => {
        SessionActions.updateSettings({ push: value })
      }
    })
    this.renderSubview(pushSwitch, this.queryByHook('push-switch'))
  }
})
