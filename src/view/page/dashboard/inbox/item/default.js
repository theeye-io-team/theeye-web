// import View from 'ampersand-view'
import BaseItem from './base'
//import eventIcons from './event-icons'

export default BaseItem.extend({
  customizeItem () {
    this.icon = this.model.event_icon
    this.message = `${this.model.target_model_state}`
  }
})
