import BaseItem from './base'
import eventIcons from './event-icons'

module.exports = BaseItem.extend({
  template: `
  <div class="inbox-entry">
  <span data-hook="icon"></span>
  <span data-hook="time"></span>
  <span data-hook="message"></span>
  </div>
  `,
  customizeItem () {
    this.message = this.model.data.model.task.subject
    this.colorClass = this.model.data.model._type
    this.icon = eventIcons[this.model.data.model._type]
  }
})
