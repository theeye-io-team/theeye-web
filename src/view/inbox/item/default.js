// import View from 'ampersand-view'
import BaseItem from './base'
import eventIcons from './event-icons'

module.exports = BaseItem.extend({
  customizeItem () {
    let state = this.sanitizeState(this.model.data.model.state)
    this.icon = eventIcons[state]
    this.message = `${state}`
  }
})
