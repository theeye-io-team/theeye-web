import JobItem from './job'
import ResourceItem from './resource'
import WebhookItem from './webhook'
import DefaultItem from './default'

const Factory = (options) => {
  const type = options.model.data.model._type

  if (type === 'Resource') {
    return new ResourceItem(options)
  } else if (/Job/.test(type)===true) {
    return new JobItem(options)
  } else if (type === 'Webhook') {
    return new WebhookItem(options)
  } else {
    return new DefaultItem(options)
  }
}

module.exports = Factory
