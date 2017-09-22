import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import Schema from 'models/monitor/schema'
//import { Model as HostGroup } from 'models/hostgroup'
//import { Model as ResourceTemplate } from 'models/resource/template'
const config = require('config')

const urlRoot = `${config.api_url}/monitor-template`

export const Model = Schema.extend({
  urlRoot: urlRoot,
  props: {
    template_resource_id: 'string', // belongs to
    hostgroup_id: 'string'
  },
  //children: {
  //  hostgroup: HostGroup, // belongs to
  //  template_resource: ResourceTemplate // has one
  //}
})

export const Collection = AppCollection.extend({
  url: urlRoot,
  model: Model
})
