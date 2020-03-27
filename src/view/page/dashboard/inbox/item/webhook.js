import BaseItem from './base'
import eventIcons from './event-icons'
import StateConstants from 'constants/states'
import meaning from './meaning'

module.exports = BaseItem.extend({
  customizeItem () {
    this.message = meaning['webhook']
    this.icon = eventIcons['success']
    this.colorClass = StateConstants.SUCCESS
  }
})
