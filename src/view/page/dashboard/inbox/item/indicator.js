import BaseItem from './base'
import * as StateConstants from 'constants/states'

const severityToColorClass = sev => sev && `severity-${sev.toLowerCase()}`

export default BaseItem.extend({
  customizeItem () {
    //let state = this.sanitizeState(this.model.data.model.state)
    let state = this.model.target_model_state
    this.message = this.model.message
    this.icon = this.model.event_icon

    // monitor execution always failure, unless used a recognized state
    if (state === 'failure') {
      this.colorClass = severityToColorClass(this.model.data.model.severity)
      if (!this.colorClass) {
        this.colorClass = StateConstants.FAILURE
      }
    } else {
      this.colorClass = StateConstants.SUCCESS
    }
  }
})
