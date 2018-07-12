import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import Schema from './monitor-schema'
//import { Model as HostGroup } from 'models/hostgroup'
//import { Model as ResourceTemplate } from 'models/resource/template'
const config = require('config')

const urlRoot = `${config.api_url}/monitor-template`

export const Model = Schema.extend({
  urlRoot: urlRoot,
  props: {
    source_model_id: 'string',
    template_resource_id: 'string', // belongs to
    hostgroup_id: 'string'
  }
})

export const Collection = AppCollection.extend({
  url: urlRoot,
  model: Model
})
