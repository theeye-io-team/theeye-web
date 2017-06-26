import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import Schema from 'models/resource/schema'
import { Model as Template } from 'models/resource/template'
import { Model as Host } from 'models/host'
import { Model as Monitor } from 'models/monitor'

const urlRoot = '/api/resource'

export const Model = Schema.extend({
  urlRoot: urlRoot,
  props: {
    template_id: 'string',
    host_id: 'string',
    monitor_id: 'string',
    hostname: 'string',
    fails_count: 'number',
    state: 'string',
    enable: 'boolean',
    creation_date: 'date',
    last_update: 'date',
    last_event: 'object',
    last_check: 'date'
  },
  children: {
    monitor: Monitor, // has one
    template: Template, // belongs to
    host: Host, // belongsto
  },
})

export const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})
