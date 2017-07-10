import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import { Model as Customer } from 'models/customer'
import { Collection as TaskTemplates } from 'models/task/template'
import { Collection as ResourceTemplates } from 'models/resource/template'
import { Collection as Hosts } from 'models/host'
//import { Collection as Monitors } from 'models/monitor/template'

const urlRoot = '/api/hostgroup'

export const Model = AppModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    customer_id: 'string',
    customer_name: 'string',
    hostname_regex: 'string',
    description: 'string',
    enable: 'boolean',
    name: 'string',
  },
  //children: {
  //  customer: Customer,
  //},
  collections: {
    hosts: Hosts, // has many host
    tasks: TaskTemplates, // has many task templates
    resources: ResourceTemplates, // has many resource templates
  }
})

export const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})
