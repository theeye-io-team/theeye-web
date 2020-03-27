import View from 'ampersand-view'
import BaseItem from './base'
import eventIcons from './event-icons'
import StateConstants from 'constants/states'
import meaning from './meaning'

const severityToColorClass = sev => `severity-${sev.toLowerCase()}`

module.exports = BaseItem.extend({
  customizeItem () {
    let state = this.sanitizeState(this.model.data.model.state)
    let monitor_event = this.model.data.monitor_event
    let custom_event = this.model.data.custom_event
    let hostname = this.model.data.hostname

    let eventIndex = custom_event || monitor_event

    this.hostName = hostname
    this.modelSubType = this.model.data.model.type
    this.message = meaning[eventIndex] || meaning[monitor_event]
    this.icon = eventIcons[eventIndex] || eventIcons[monitor_event]

    // monitor execution always failure, unless used a recognized state
    if (state!=='normal') {
      this.colorClass = severityToColorClass(this.model.data.model.failure_severity)
      if (!this.colorClass) {
        this.colorClass = StateConstants.FAILURE
      }
    } else {
      this.colorClass = StateConstants.SUCCESS
    }
  }
})
