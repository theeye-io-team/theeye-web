import App from 'ampersand-app'
import View from 'ampersand-view'
import SimpleSwitch from 'components/simple-switch'

import { JOB_CRUD_NOTIFICATION_FILTER, WEBHOOK_NOTIFICATION_FILTER, MONITOR_STATE_NOTIFICATION_FILTER } from 'constants/notifications'

export default View.extend({
  template: `
    <div class="tab-pane fade in">
      <h3 class="blue bold">NOTIFICATION TYPES</h3>

      <div class="row border">
        <div class="col-xs-4">
          <div class="check-container">
            <label for="check2">Mobile Notifications</label>
          </div>
        </div>
        <div class="col-xs-4">
          <small class="gray">Enable/Disable Mobile Notifications</small>
        </div>
        <div class="col-sm-4 text-right" data-hook="push"></div>
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

      <div class="row border">
        <div class="col-xs-4">
          <div class="check-container">
            <label for="check2">Email Notifications</label>
          </div>
        </div>
        <div class="col-xs-4">
          <small class="gray">Enable/Disable Email Notifications</small>
        </div>
        <div class="col-sm-4 text-right" data-hook="email"></div>
      </div>

      <br>
      <h3 class="blue bold">NOTIFICATION EVENTS</h3>

      <div class="row border">
        <div class="col-xs-4">
          <div class="check-container">
            <label for="check2">Notify me about Tasks</label>
          </div>
        </div>
        <div class="col-xs-4">
          <small class="gray">Enable/Disable Tasks Jobs Notifications</small>
        </div>
        <div class="col-sm-4 text-right" data-hook="job-crud"></div>
      </div>

      <div class="row border">
        <div class="col-xs-4">
          <div class="check-container">
            <label for="check2">Notify me about Webhooks</label>
          </div>
        </div>
        <div class="col-xs-4">
          <small class="gray">Enable/Disable Webhooks Triggered Notifications</small>
        </div>
        <div class="col-sm-4 text-right" data-hook="webhook-triggered"></div>
      </div>

      <div class="row border">
        <div class="col-xs-4">
          <div class="check-container">
            <label for="check2">Notify me about Monitors</label>
          </div>
        </div>
        <div class="col-xs-4">
          <small class="gray">Enable/Disable Monitors Status Notifications</small>
        </div>
        <div class="col-sm-4 text-right" data-hook="monitor-state"></div>
      </div>
  `,
  render () {
    this.renderWithTemplate(this)

    const notify = App.state.session.user.notifications
    this.renderSwitch('push', notify.push)
    this.renderSwitch('desktop', notify.desktop)
    this.renderSwitch('email', notify.email)
    // this.renderSwitch('mute', notify.mute)

    const filterJobs = App.state.session.user.notifications.getExclusionFilter(JOB_CRUD_NOTIFICATION_FILTER)
    this.renderExclusionSwitch(JOB_CRUD_NOTIFICATION_FILTER, !filterJobs)

    const filterWebhooks = App.state.session.user.notifications.getExclusionFilter(WEBHOOK_NOTIFICATION_FILTER)
    this.renderExclusionSwitch(WEBHOOK_NOTIFICATION_FILTER, !filterWebhooks)

    const filterMonitors = App.state.session.user.notifications.getExclusionFilter(MONITOR_STATE_NOTIFICATION_FILTER)
    this.renderExclusionSwitch(MONITOR_STATE_NOTIFICATION_FILTER, !filterMonitors)
  },
  renderSwitch (name, value) {
    const btn = new SimpleSwitch({ value: value || false })
    btn.on('change:value', () => {
      let settings = {}
      settings[name] = btn.value
      App.actions.session.updateNotifications(settings)
    })
    this.renderSubview(btn, this.queryByHook(name))
  },
  renderExclusionSwitch (filter, value) {
    const btn = new SimpleSwitch({ value: value || false })
    btn.on('change:value', () => {
      App.actions.session.updateNotificationsFilters(filter, !btn.value)
    })
    this.renderSubview(btn, this.queryByHook(filter.topic))
  }
})
