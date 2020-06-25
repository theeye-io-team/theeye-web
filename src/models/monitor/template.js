import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import Schema from './schema'
import config from 'config'

const Model = Schema.extend({
  props: {
    source_model_id: 'string',
    template_resource_id: 'string', // belongs to
    hostgroup_id: 'string'
  }
})

const Collection = AppCollection.extend({ model: Model })

export { Model, Collection }
