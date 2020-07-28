import App from 'ampersand-app'
import BaseItem from './base'
import * as StateConstants from 'constants/states'

export default BaseItem.extend({
  customizeItem () {
    //this.message = messageFactory(this.model)
    //this.icon = 

    this.hostName = ''
    this.modelName = this.model.data.model.name || 'undefined'
    this.message = this.model.message
    this.icon = this.model.event_icon
    this.colorClass = StateConstants.SUCCESS
  }
})
