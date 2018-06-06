import View from 'ampersand-view'
import BaseItem from './base'

module.exports = BaseItem.extend({
  customizeItem () {
    let state = this.sanitizeState(this.model.data.model.state)
    //console.warning(this.model)
    this.icon = eventIcons[state]
    this.message = `${state}`
  }
})
