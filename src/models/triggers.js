import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'

/**
 *
 * model used in templates configuration page
 *
 *
 */
const Model = AmpersandState.extend({
  props: {
    task: 'object',
    task_id: 'string',
    event_type: 'string',
    event_name: 'string',
    emitter_id: 'string',
    emitter_type: 'string'
  }
})

const Collection = AmpersandCollection.extend({ model: Model })

export { Collection, Model }
