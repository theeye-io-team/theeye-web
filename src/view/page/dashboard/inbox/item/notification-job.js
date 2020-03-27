import BaseItem from './base'
import EventIcons from './event-icons'
import StateConstants from 'constants/states'
import messageFactory from 'models/notification/messageFactory'

module.exports = BaseItem.extend({
  props: {
    body: 'string'
  },
  bindings: Object.assign({}, BaseItem.prototype.bindings, {
    body: { hook: 'body' }
  }),
  template: require('./inboxNotificationRow.hbs'),
  customizeItem () {
    let notification = this.model
    this.colorClass = notification.data.model._type
    this.icon = EventIcons[notification.data.model._type]
    this.message = messageFactory(notification)
    this.modelName = notification.data.model.name
    this.body = notification.data.notification.body
  }
})
