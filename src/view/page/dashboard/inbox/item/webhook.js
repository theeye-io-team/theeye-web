import BaseItem from './base'
import * as StateConstants from 'constants/states'

export default BaseItem.extend({
  customizeItem () {
    this.message = this.model.message
    this.icon = this.model.event_icon
    this.colorClass = StateConstants.SUCCESS
  }
})
