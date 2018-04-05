import AppCollection from 'lib/app-collection'
import Schema from './resource-schema'
import { Model as MonitorTemplate } from './monitor-template'
//import { Model as HostGroup } from 'models/hostgroup'

const config = require('config')
const urlRoot = `${config.api_url}/resource-template`

const Model = Schema.extend({
	props: {
    hostgroup_id: 'string' // belongs to
	},
  children: {
    //hostgroup: HostGroup,
    template_monitor: MonitorTemplate // has one
  }
})

const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})

exports.Model = Model
exports.Collection = Collection
