import BaseItem from './base'
import * as StateConstants from 'constants/states'

const stateToColorClass = (state) => (StateConstants.STATES.indexOf(state)!==-1) ? state : null

export default BaseItem.extend({
  customizeItem () {
    // it is a task execution
    this.message = this.model.message
    this.icon = this.model.event_icon

    let hostname = ''
    if (this.model.target_model.host) {
      hostname = this.model.target_model.host.hostname
    }
    this.hostName = hostname

    if (this.model.target_model.task) {
      this.modelSubType = this.model.target_model_subtype
    }

    if (this.modelName === 'agent:config:update') {
      this.modelName = `${hostname} configuration update`
    }

    // task execution always success, unless declared a failure
    let state = this.model.target_model_state
    this.colorClass = stateToColorClass(state) || StateConstants.SUCCESS
  }
})
