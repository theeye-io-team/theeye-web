import App from 'ampersand-app'
import BaseItem from './base'
import StateConstants from 'constants/states'
// import meaning from './meaning'
import eventIcons from './event-icons'
import messageFactory from 'models/notification/messageFactory'

module.exports = BaseItem.extend({
  customizeItem () {
    // it is a workflow execution
    // let operation = this.model.data.operation
    this.hostName = ''
    this.modelName = this.model.data.model.name || 'undefined'

    // this.message = meaning['job:' + operation] || ''
    // this.icon = eventIcons['job:' + operation] || ''

    this.message = messageFactory(this.model)
    this.icon = eventIcons['job:' + this.model.data.operation] || ''

    this.colorClass = StateConstants.SUCCESS
  }
})
