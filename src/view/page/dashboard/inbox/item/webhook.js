import BaseItem from './base'
import eventIcons from './event-icons'
import * as StateConstants from 'constants/states'
import meaning from './meaning'

export default BaseItem.extend({
  customizeItem () {
    this.message = meaning['webhook']
    this.icon = eventIcons['success']
    this.colorClass = StateConstants.SUCCESS
  }
})
