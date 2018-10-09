import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'

const TaskEvent = AmpersandState.extend({
  props: {
    task_id: 'string',
    task: 'object',
    events: ['array',false,() => { return [] }]
  }
})

exports.TaskEvents = AmpersandCollection.extend({ model: TaskEvent })
