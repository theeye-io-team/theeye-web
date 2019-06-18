import View from 'ampersand-view'
import BaseItem from './base'
import StateConstants from 'constants/states'
import LifecycleConstants from 'constants/lifecycle'
import eventIcons from './event-icons'
import messageFactory from 'models/notification/messageFactory'

const stateToColorClass = (state) => (StateConstants.STATES.indexOf(state)!==-1) ? state : null

module.exports = BaseItem.extend({
  customizeItem () {
    // it is a task execution
    let state = this.sanitizeState(this.model.data.model.state)
    let lifecycle = this.model.data.model.lifecycle
    //this.message = meaning['lifecycle:' + lifecycle] || `${lifecycle}:${state}`
    this.message = messageFactory(this.model)

    if (this.modelName === 'agent:config:update') {
      let hostname = this.model.data.model.host.hostname
      this.modelName = `${hostname} configuration update`
    }

    if (lifecycle === LifecycleConstants.FINISHED) {
      if (state === StateConstants.FAILURE) {
        this.icon = eventIcons[state]
      } else {
        this.icon = eventIcons[StateConstants.SUCCESS]
      }
    } else {
      this.icon = eventIcons['lifecycle:' + lifecycle]
    }

    // task execution always success, unless declared a failure
    this.colorClass = stateToColorClass(state)
    if (!this.colorClass) {
      this.colorClass = StateConstants.SUCCESS
    }
  }
})
