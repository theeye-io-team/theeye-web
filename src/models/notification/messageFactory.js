import meaning from 'view/page/dashboard/inbox/item/meaning'

export default (notification) => {
  const data = notification.data
  const type = data.model._type
  let state = data.model.state || ''
  state = state ? state.toLowerCase().replace(/ /g, '_') : 'unknown'

  if (type === 'NotificationJob' && notification.topic === 'notification-task') {
    return data.notification.subject
  } else if (type === 'Resource') {
    let eventIndex = data.custom_event || data.monitor_event
    return meaning[eventIndex] || meaning[data.monitor_event]
  } else if (/WorkflowJob/.test(type) === true) {
    return meaning['job:' + data.operation] || ''
  } else if (/Job/.test(type) === true) {
    let lifecycle = data.model.lifecycle
    return meaning['lifecycle:' + lifecycle] || `${lifecycle}:${state}`
  } else if (type === 'Webhook') {
    return meaning['webhook']
  } else {
    return state
  }
}
