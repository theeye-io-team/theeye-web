'use strict'

import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import Schema from 'models/monitor/schema'
import { Model as Template } from 'models/monitor/template'
//import { Model as Host } from 'models/host'

const urlRoot = '/api/monitor'

export const Model = Schema.extend({
  urlRoot: urlRoot,
  props: {
    host_id: 'string',
    resource_id: 'string',
    template_id: 'string',
    enable: 'boolean',
    creation_date: 'date',
    last_update: 'date'
  },
  children: {
    template: Template,
    //host: Host,
    //resource: Resource
  },
})

export const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})
