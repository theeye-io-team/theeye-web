import AppModel from 'lib/app-model'
import meaning from './meaning'
import eventIcons from './event-icons'
import * as LifecycleConstants from 'constants/lifecycle'
import * as StateConstants from 'constants/states'

// this model is bound to that on /api/models/notification
export default AppModel.extend({
  props: {
    id: 'string',
    user_id: {type: 'string', required: true},
    event_id: {type: 'string', required: true},
    topic: {type: 'string', required: true},
    notified: {type: 'boolean', default: false},
    read: {type: 'boolean', default: false},
    data: {type: 'object', default: () => { return {} } },
    creation_date: 'date',
    last_update: 'date'
  },
  derived: {
    target_model: {
      deps: ['data'],
      fn () {
        if (!this.data || !this.data.model) { return {} }
        return this.data.model
      }
    },
    target_model_type: {
      deps: ['target_model'],
      fn () {
        // _type is the Model schema Document
        // type in Resource is the class type script, scraper, process, dstat, etc
        return (this.target_model._type || this.target_model.type)
      }
    },
    target_model_subtype: {
      deps: ['target_model_type'],
      fn () {
        if (this.target_model_type === 'Resource') {
          return this.target_model.type
        }
        if (/Job/.test(this.target_model_type) === true) {
          return this.target_model.type
        }
        return ''
      }
    },
    target_model_state: {
      deps: ['target_model'],
      fn () {
        return sanitizeState(this.target_model.state)
      }
    }
  },
  session: {
    message: 'string',
    title: 'string',
    event_icon: 'string'
  },
  initialize () {
    this.message = this.messageFactory()
    this.title = this.titleFactory()
    this.event_icon = this.eventIcon()
  },
  messageFactory () {
    const data = this.data
    //const type = data.model._type
    const type = this.target_model_type

    let state = this.target_model.state || ''
    state = state ? state.toLowerCase().replace(/ /g, '_') : 'unknown'

    if (type === 'NotificationJob' && this.topic === 'notification-task') {
      return data.notification.subject
    } else if (type === 'Resource') {
      let eventIndex = data.custom_event || data.monitor_event
      return meaning[eventIndex] || meaning[data.monitor_event]
    } else if (/WorkflowJob/.test(type) === true) {
      return meaning['job:' + data.operation] || ''
    } else if (/Job/.test(type) === true) {
      let lifecycle = this.target_model.lifecycle
      return meaning['lifecycle:' + lifecycle] || `${lifecycle}:${state}`
    } else if (type === 'Webhook') {
      return meaning['webhook']
    } else {
      return state
    }
  },
  titleFactory () {
    const model = this.target_model
    //const type = data.model._type
    const type = this.target_model_type

    if (type === 'NotificationJob') {
      return model.name
    } else if (type === 'Resource') {
      return 'Resource ' + model.name
    } else if (/WorkflowJob/.test(type) === true) {
      return 'Workflow ' + model.name
    } else if (/Job/.test(type) === true) {
      return 'Task ' + model.name
    } else if (type === 'Webhook') {
      return 'Webhook ' + model.name
    } else {
      return ''
    }
  },
  eventIcon () {
    let model = this.target_model
    let type = model._type
    let state = this.target_model.state || ''

    if (type === 'NotificationJob' && this.topic === 'notification-task') {
      return eventIcons[type]
    } else if (type === 'Resource') {
      let custom_event = this.data.custom_event
      let monitor_event = this.data.monitor_event
      let eventIndex = (custom_event || monitor_event)
      return eventIcons[eventIndex] || eventIcons[monitor_event]
    } else if (/WorkflowJob/.test(type) === true) {
      return eventIcons['job:' + this.data.operation] || ''
    } else if (/Job/.test(type) === true) {
      let lifecycle = model.lifecycle
      let icon = ''
      if (lifecycle === LifecycleConstants.FINISHED) {
        if (state === StateConstants.FAILURE) {
          icon = eventIcons[StateConstants.FAILURE]
        } else {
          icon = eventIcons[StateConstants.SUCCESS]
        }
      } else {
        icon = eventIcons['lifecycle:' + lifecycle]
      }
      return icon
    } else if (type === 'Webhook') {
      return eventIcons[StateConstants.SUCCESS]
    } else {
      return eventIcons[StateConstants.SUCCESS]
    }
  }
})

const sanitizeState = (state) => {
  if (!state) { return '' }
  return state.toLowerCase().replace(/ /g, '_')
}
