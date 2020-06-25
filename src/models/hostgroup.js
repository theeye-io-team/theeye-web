import App from 'ampersand-app'
import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import { Model as Customer } from 'models/customer'
import { Collection as Hosts } from 'models/host'
import { Collection as Tasks } from 'models/task'
import { Collection as Resources } from 'models/resource'
import { Collection as Files } from 'models/file'
import config from 'config'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/hostgroup`
}

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

export const Model = AppModel.extend({
  urlRoot,
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

export const Collection = AppCollection.extend({
  model: Model,
  url: urlRoot
})
