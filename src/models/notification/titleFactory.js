export default (notification) => {
  const data = notification.data
  const type = data.model._type

  if (type === 'NotificationJob') {
    return data.model.task.name
  } else if (type === 'Resource') {
    return 'Resource ' + data.model.name
  } else if (/WorkflowJob/.test(type) === true) {
    return 'Workflow ' + data.model.name
  } else if (/Job/.test(type) === true) {
    return 'Task ' + data.model.name
  } else if (type === 'Webhook') {
    return 'Webhook ' + data.model.name
  } else {
    return ''
  }
}
