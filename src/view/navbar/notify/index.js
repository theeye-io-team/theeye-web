import App from 'ampersand-app'
import View from 'ampersand-view'
import NotificationActions from 'actions/notifications'
import NavbarActions from 'actions/navbar'

import moment from 'moment'

import './style.less'

const resourceType = {
  Resource: 'Resource',
  ScriptJob: 'Task'
}
const meaning = {
  ready: 'executed, waiting for result',
  finished: 'finished running',
  updates_stopped: 'has gone silent',
  recovered: 'came back to life'
}
const icons = {
  ready: 'fa fa-clock-o',
  assigned: 'fa fa-clock-o',
  finished: 'fa fa-check-circle',
  terminated: 'fa fa-check-circle',
  completed: 'fa fa-check-circle',
  normal: 'fa fa-check-circle',
  recovered: 'fa fa-check-circle',
  updates_stopped: 'fa fa-exclamation-triangle'
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
    text: 'string',
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
    message: {
      hook: 'message'
    },
    icon: {
      type: 'attribute',
      name: 'class',
      hook: 'icon'
    },
    time: {
      hook: 'time'
    },
    modelName: {
      hook: 'modelName'
    },
    modelType: {
      hook: 'modelType'
    },
    severity: {
      type: 'class'
    }
  },
  initialize () {
    this.inboxify()
  },
  inboxify () {
    this.modelName = this.model.data.model.name
    this.modelType = resourceType[this.model.data.model_type]
    this.icon = ''
    this.severity = ''
    let format = 'L [at] LT'
    if (new Date().toDateString() === new Date(this.model.createdAt).toDateString()) {
      format = '[Today at] LT'
    }
    this.time = moment(this.model.createdAt).format(format)
    switch (this.model.data.model._type) {
      case 'ScriptJob':
        // state: unknown, success, failure
        // lifecycle:
        //    inProgress: ready, assigned
        //    isCompleted: finished, terminated, completed
        //    isTerminated?: canceled, expired

        this.message = meaning[this.model.data.model.lifecycle] ||
          `${this.model.data.model.lifecycle}:${this.model.data.model.state}`
        this.severity = this.model.data.model.state
        this.icon = icons[this.model.data.model.lifecycle]
        break
      case 'Resource':
        this.message = meaning[this.model.data.monitor_event] ||
          `${this.model.data.monitor_event}:${this.model.data.model.state}`
        this.severity = this.model.data.model.state
        this.icon = icons[this.model.data.monitor_event]
        break
    }
  }
})

module.exports = View.extend({
  template: `
    <span class="inbox eyemenu-panel-launcher pull-left">
      <i data-hook="bell" class="fa">&nbsp;</i>
      <span class="badge" data-hook="badge">0</span>
      <div class="inbox-popup" data-hook="inbox-popup">
        <div class="arrow-up"></div>
        <div class="header">
          <div data-hook="inbox-settings-container" class="inbox-settings-pane">
            <div>
              <h3>Your notifications preferences</h3>
            </div>
          </div>
          <span data-hook="inbox-settings-switch" class="left-0 fa fa-cog"></span>
          <h3>Notifications</h3>
          <span data-hook="inbox-notifications-empty" class="right-0 fa fa-trash-o"></span>
        </div>
        <div>
          <div class="inbox-popup-body" data-hook="inbox-popup-container"></div>
        </div>
      </div>
    </span>
  `,
  props: {
    unread: ['number',true,0],
    inboxOpen: ['boolean',false,false],
    showBadge: ['boolean',false,false],
    isEmpty: ['boolean',true,true],
    //showSettings: ['boolean',true,false]
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
      },
      //{
      //  type: 'toggle',
      //  hook: 'no-notifications'
      //},
      //{
      //  type: 'toggle',
      //  hook: 'inbox-popup-container',
      //  invert: true
      //}
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
    //showSettings: {
    //  type: 'booleanClass',
    //  name: 'visible',
    //  hook: 'inbox-settings-container'
    //}
  },
  initialize (options) {
    this.collection || (this.collection = App.state.notifications)

    this.listenToAndRun(this.collection, 'change sync reset remove', this.updateCounts)
    this.listenToAndRun(this.collection, 'add', this.handleAdd)
    this.on('change:inboxOpen', this.onInboxToggle)
    this.clickHandler = this.onClick.bind(this)
  },
  onClick (event) {
    // if inbox is closed this is not our business and the
    // click event is handled by the this.events hash
    if (!this.inboxOpen) {
      return
    }

    // the only thing we want to do is close the inbox
    // whenever the click is outside
    if (!this.isDescendant(this.el, event.target)) {
      this.inboxOpen = false
    }
  },
  isDescendant (parent, child) {
    let node = child.parentNode
    while (node != null) {
      if (node === parent) {
        return true
      }
      node = node.parentNode
    }
    return false
  },
  events: {
    'click [data-hook=bell]': function (event) {
      this.toggle('inboxOpen')
    },
    'click [data-hook=inbox-settings-switch]': function (event) {
      //this.toggle('showSettings')
      NavbarActions.toggleSettingsMenu()
      NavbarActions.toggleTab('notifications')
    },
    'click [data-hook=inbox-notifications-empty]': function (event) {
      NotificationActions.removeAllRead()
    }
  },
  onInboxToggle () {
    if (this.inboxOpen === true) {
      NotificationActions.markAllRead()
    }
  },
  handleAdd (model) {
    if (this.inboxOpen) {
      model.read = true
      model.save()
    } else {
      this.updateCounts()
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

    // special handler for dialog-like popup behavior
    document.body.addEventListener('click', this.clickHandler, true)
  },
  remove () {
    View.prototype.remove.apply(this, arguments)
    document.body.removeEventListener('click', this.clickHandler, true)
  }
})
