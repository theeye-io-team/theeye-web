import App from 'ampersand-app'
import View from 'ampersand-view'
import NotificationActions from 'actions/notifications'
import Modalizer from 'components/modalizer'
import SettingsView from './settings-pane'
import InboxRowFactory from './item/factory'

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

const EmptyView = View.extend({
  template: `<div class="no-notifications" data-hook="no-notifications">No notifications</div>`
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
      InboxRowFactory,
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
