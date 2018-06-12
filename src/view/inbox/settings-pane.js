import App from 'ampersand-app'
import View from 'ampersand-view'
import NavbarActions from 'actions/navbar'
import SessionActions from 'actions/session'
import SimpleSwitch from 'components/simple-switch'

import { JOB_START_NOTIFICATION } from 'constants/notifications'

const FilterSwitch = View.extend({
  props: {
    label: 'string',
    filter: 'object'
  },
  bindings: {
    label: {
      hook: 'label'
    }
  },
  template: `
    <div class="row" style="padding-top: 10px; padding-bottom: 10px;">
      <div class="col-xs-1"></div>
      <div class="col-xs-7">
        <span data-hook="label" class="option-label"></span>
      </div>
      <div class="col-xs-3 text-right">
        <span data-hook="switch"></span>
      </div>
      <div class="col-xs-1"></div>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    // tricky section:
    // default options are always ON/true because by default
    // all notifications are shown. De-activating an option
    // means the user INSERTS an EXCLUSION FILTER.
    // Creating a switch, hence, means to SHOW THE USER
    // default options (ON/true) or modified (OFF/false)
    // options (EXLUSION FILTER in effect)

    // determine if exclusion filter exists in user options
    const filter = this.filter
    const filtered = App.state.session.user.notifications.getExclusionFilter(filter)

    // if it DOES EXIST (the user has previously de-activated it)
    // create the switch as with OFF/false value
    const filterSwitch = new SimpleSwitch({ value: !filtered })
    filterSwitch.on('change:value', () => {
      // tricky: false means to INSERT an EXCLUSION FILTER
      // (read above comment)
      SessionActions.toggleExclusionFilter(
        filter,
        !filterSwitch.value
      )
    })
    this.renderSubview(filterSwitch, this.queryByHook('switch'))
  }
})

export default View.extend({
  template: `
    <div class="container-fluid settings-panel">
      <div class="row">
        <div class="col-xs-12" data-hook="switchs-container"></div>
        <div class="col-xs-12 text-center footer">
          <a class="settings-link" href="#">
            <i class="fa fa-gears"></i>
            More options
          </a>
        </div>
      </div>
    </div>
  `,
  events: {
    'click a.settings-link': function (event) {
      event.preventDefault()

      NavbarActions.toggleSettingsMenu()
      NavbarActions.toggleTab('notifications')
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.renderSubview(
      new FilterSwitch({
        label: 'Notify me of launched tasks',
        filter: JOB_START_NOTIFICATION
      }),
      this.queryByHook('switchs-container')
    )
  }
})
