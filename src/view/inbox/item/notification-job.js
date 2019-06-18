import BaseItem from './base'
import EventIcons from './event-icons'
import messageFactory from 'models/notification/messageFactory'

module.exports = BaseItem.extend({
  template: `
    <div class="inbox-entry">
      <span data-hook="icon"></span>
      <span data-hook="time"></span>
      <span data-hook="modelName" class="label label-primary"></span>
      <span data-hook="message"></span>
    </div>
  `,
  customizeItem () {
    let notification = this.model
    this.colorClass = notification.data.model._type
    this.icon = EventIcons[notification.data.model._type]
    this.message = messageFactory(notification)
    this.modelName = notification.data.model.name
  }
})
