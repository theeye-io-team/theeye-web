'use strict'

import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import Schema from 'models/monitor/schema'
const Template = require('models/monitor/template').Model
const Host = require('models/host').Model
const config = require('config')

const urlRoot = `${config.api_url}/monitor`

const Model = Schema.extend({
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
    host: Host
  },
})

const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})

exports.Model = Model
exports.Collection = Collection
