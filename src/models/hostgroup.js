import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const Customer = require('models/customer').Model
const Hosts = require('models/host').Collection
const Tasks = require('models/task').Collection
const Resources = require('models/resource').Collection
const Files = require('models/file').Collection
const config = require('config')

const urlRoot = `${config.api_url}/hostgroup`

const EventTemplate = AmpersandState.extend({
	props: {
    _id: 'string',
		emitter_template_id: 'string',
		event_name: 'string',
		event_type: 'string',
		task_template_id: 'string',
    task_template: 'object'
	}
})

const EventTemplates = AmpersandCollection.extend({
  model: EventTemplate
})

const Model = AppModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    customer_id: 'string',
    customer_name: 'string',
    hostname_regex: 'string',
    description: 'string',
    enable: 'boolean',
    name: 'string',
    creation_date: 'date',
    last_update: 'date',
    hostname_regex: 'string',
    _type: 'string'
  },
  collections: {
    hosts: Hosts, // has many host
    tasks: Tasks, // has many task
    resources: Resources, // has many resource
    triggers: EventTemplates, // has many event templates
    files: Files // has many file templates
  }
})

const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})

exports.Model = Model
exports.Collection = Collection
