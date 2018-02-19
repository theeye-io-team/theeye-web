import App from 'ampersand-app'
import View from 'ampersand-view'
import NotificationActions from 'actions/notifications'
import moment from 'moment'
import Modalizer from 'components/modalizer'
import FormView from 'ampersand-form-view'
import SettingsView from './settings-pane'
import StateConstants from 'constants/states'
//import bootbox from 'bootbox'

const DeleteNotificationsView = View.extend({
  template: `
    <div>
      <span>Delete read notifications?</span>
      <div style="bottom:0; position:absolute;">
        <label>
          <input style="margin:0; height:18px; top:5px; position:relative;" type="checkbox">
          <small>
            Also delete unread notifications.
          </small>
        </label> 
      </div>
    </div>
  `
})

import './style.less'

const resourceType = {
  Resource: 'Resource',
  ScriptJob: 'Task'
}

const meaning = {
  ready: 'queued, waiting for result',
  finished: 'finished running',
  updates_stopped: 'has gone silent',
  updates_started: 'came back to life',
  failure: 'is not working properly',
  canceled: 'has been canceled',
  recovered: 'came back to normal'
}

const icons = {
  ready: 'fa fa-clock-o',
  assigned: 'fa fa-clock-o',
  finished: 'fa fa-check-circle',
  completed: 'fa fa-check-circle',
  terminated: 'fa fa-question-circle',
  canceled: 'fa fa-minus-circle',
  normal: 'fa fa-check-circle',
  failure: 'fa fa-exclamation-circle',
  recovered: 'fa fa-check-circle',
  updates_started: 'fa fa-check-circle',
  updates_stopped: 'fa fa-exclamation-circle'
}

const EmptyView = View.extend({
  template: `<div class="no-notifications" data-hook="no-notifications">No notifications</div>`
})

const InboxPopupRow = View.extend({
  props: {
    severity: 'string',
    modelType: 'string',
    modelName: 'string',
    message: 'string',
    time: 'string',
    icon: 'string',
    text: 'string'
  },
  template: `
    <div class="inbox-entry">
      <span data-hook="severity"></span>
      <span data-hook="icon"></span>
      <span data-hook="time"></span>
      <span data-hook="modelType"></span>
      <span data-hook="modelName" class="label label-primary"></span>
      <span data-hook="message"></span>
    </div>
  `,
  bindings: {
    message: { hook: 'message' },
    time: { hook: 'time' },
    modelName: { hook: 'modelName' },
    modelType: { hook: 'modelType' },
    severity: { type: 'class' },
    icon: {
      type: 'attribute',
      name: 'class',
      hook: 'icon'
    }
  },
  initialize () {
    this.inboxify()
  },
  inboxify () {
    let format = 'L [at] LT'
    if (new Date().toDateString() === new Date(this.model.createdAt).toDateString()) {
      format = '[Today at] LT'
    }

    const state = sanitizeState(this.model.data.model.state)
    const type = this.model.data.model._type

    this.time = moment(this.model.createdAt).format(format)
    this.modelName = this.model.data.model.name
    this.modelType = resourceType[this.model.data.model_type]
    this.icon = ''

    this.severity = stateToSeverity(state)

    if (type === 'Resource') { // it is resources notification
      let monitor_event = this.model.data.monitor_event
      this.message = meaning[monitor_event] || `${monitor_event}:${state}`
      this.icon = icons[monitor_event]

      // monitor execution always failure, unless used a recognized state
      if (!this.severity) this.severity = StateConstants.FAILURE

    } else if (/Job/.test(type)===true) { // it is a task execution
      let lifecycle = this.model.data.model.lifecycle
      this.message = meaning[lifecycle] || `${lifecycle}:${state}`
      this.icon = icons[lifecycle]

      // task execution always success, unless declared a failure
      if (!this.severity) this.severity = StateConstants.SUCCESS

    } else {
      console.warning(this.model)
      this.icon = icons[state]
      this.message = `${state}`
    }
  }
})

const sanitizeState = (state) => state.toLowerCase().replace(/ /g,"_")

const stateToSeverity = (state) => (StateConstants.STATES.indexOf(state)!==-1) ? state : null

module.exports = View.extend({
  template: `
    <span class="inbox eyemenu-panel-launcher pull-left">
      <i data-hook="bell" class="fa">&nbsp;</i>
      <span class="badge" data-hook="badge">0</span>
      <div class="inbox-popup" data-hook="inbox-popup">
        <div class="arrow-up"></div>
        <div class="header">
          <span data-hook="inbox-settings-switch" class="left-0 fa fa-cog"></span>
          <h3 data-hook="header-title">Notifications</h3>
          <span data-hook="inbox-notifications-empty" class="right-0 fa fa-trash-o"></span>
        </div>
        <div>
          <div data-hook="inbox-settings-container" class="inbox-settings-pane"></div>

          <div class="inbox-popup-body" data-hook="inbox-popup-container"></div>
        </div>
      </div>
    </span>`,
  props: {
    unread: ['number', true, 0],
    inboxOpen: ['boolean', false, false],
    showBadge: ['boolean', false, false],
    isEmpty: ['boolean', true, true],
    showSettings: ['boolean', true, false],
    ignoreOutOfTheBoxClick: ['boolean', true, false]
  },
  derived: {
    headerTitle: {
      deps: ['showSettings'],
      fn: function () {
        return this.showSettings
          ? 'Preferences'
          : 'Notifications'
      }
    }
  },
  bindings: {
    inboxOpen: {
      type: 'toggle',
      hook: 'inbox-popup'
    },
    isEmpty: [
      {
        type: 'booleanClass',
        no: 'fa-bell',
        yes: 'fa-bell-o',
        hook: 'bell'
      }
    ],
    unread: [
      {
        type: 'text',
        hook: 'badge'
      },
      {
        type: 'toggle',
        hook: 'badge'
      }
    ],
    showSettings: [
      {
        type: 'toggle',
        hook: 'inbox-settings-container'
      },
      {
        type: 'toggle',
        hook: 'inbox-popup-container',
        invert: true
      },
      {
        type: 'toggle',
        hook: 'inbox-notifications-empty',
        invert: true
      },
      {
        type: 'booleanClass',
        hook: 'inbox-settings-switch',
        yes: 'fa-arrow-circle-left',
        no: 'fa-cog'
      }
    ],
    headerTitle: {
      hook: 'header-title'
    }
  },
  initialize (options) {
    //this.updateFilters = this.updateFilters.bind(this)
    // this.collection || (this.collection = App.state.notifications)
    this.collection = App.state.inbox.filteredNotifications

    this.listenToAndRun(this.collection, 'add sync reset remove', this.updateCounts)
    this.on('change:inboxOpen', this.onInboxToggle)
    this.clickHandler = this.onAnywereClick.bind(this)

    this.listenToAndRun(App.state.inbox,'change',() => {
      this.updateState(App.state.inbox)
    })
  },
  updateState (state) {
    this.inboxOpen = state.isOpen
  },
  onAnywereClick (event) {
    // if inbox is closed this is not our business and the
    // click event is handled by the this.events hash
    if (!this.inboxOpen || this.ignoreOutOfTheBoxClick) return

    // the only thing we want to do is close the inbox
    // whenever the click is outside
    if (!isDescendant(this.el, event.target)) {
      NotificationActions.toggleInboxOpen()
    }
  },
  events: {
    'click [data-hook=bell]': function (event) {
      NotificationActions.toggleInboxOpen()
    },
    'click [data-hook=inbox-settings-switch]': function (event) {
      this.toggle('showSettings')
    },
    'click [data-hook=inbox-notifications-empty]': "onClickEmptyInbox"
  },
  onClickEmptyInbox (event) {
    const body = new DeleteNotificationsView()
    const modal = new Modalizer({
      confirmButton: 'Delete',
      buttons: true,
      title: 'Notifications',
      bodyView: body
    })

    this.ignoreOutOfTheBoxClick = true
    modal.on('confirm', event => {
      let removeAll = body.query('input').checked
      NotificationActions.removeAllRead(removeAll)
      modal.hide()
    })

    this.listenTo(modal,'hidden',() => {
      this.ignoreOutOfTheBoxClick = false
      modal.remove()
      body.remove()
    })

    modal.query('.modal-dialog').style.width = '600px'
    modal.show()
  },
  onInboxToggle () {
    if (this.inboxOpen === true) {
      NotificationActions.markAllRead()
    } else {
      this.showSettings = false
    }
  },
  updateCounts () {
    const reducer = (acc, cur) => acc + (cur.read ? 0 : 1)
    this.isEmpty = this.collection.isEmpty()
    this.unread = this.collection.toJSON().reduce(reducer, 0)
    this.showBadge = this.unread !== 0
  },
  render () {
    this.renderWithTemplate(this)

    this.list = this.renderCollection(
      this.collection,
      InboxPopupRow,
      this.queryByHook('inbox-popup-container'),
      {
        emptyView: EmptyView
      }
    )

    this.renderSubview(
      new SettingsView({parent: this}),
      this.queryByHook('inbox-settings-container')
    )

    // special handler for dialog-like popup behavior
    document.body.addEventListener('click', this.clickHandler, true)
  },
  remove () {
    View.prototype.remove.apply(this, arguments)
    document.body.removeEventListener('click', this.clickHandler, true)
  }
})

const isDescendant = (parent, child) => {
  let node = child.parentNode
  while (node != null) {
    if (node === parent) {
      return true
    }
    node = node.parentNode
  }
  return false
}
