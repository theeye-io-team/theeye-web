import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

//import { Model as Customer } from 'models/customer'
//import { Model as User } from 'models/user'
//import { Model as Script } from 'models/script'
import { Collection as Events } from 'models/event'

const Schema = AppModel.extend({
	props: {
    id: 'string',
		user_id: 'string',
		customer_id: 'string',
		public: 'boolean',
		tags: 'array',
		name: 'string',
		description: 'string',
		acl: 'array',
		secret: 'string',
		grace_time: 'number',
		type: 'string',
    _type: 'string' // discriminator
	},
	collections: {
  //	customer: Customer,
  //	user: User, // owner/creator
		triggers: Events,
	},
  serialize (options) {
    var serial = AppModel.prototype.serialize.call(this,options)

    serial.triggers = this.triggers.map( trigger => {
      return trigger ? trigger.id : null
    })

    return serial
  }
})

const urlRoot = '/api/task-template'

export const Script = Schema.extend({
  urlRoot: urlRoot,
	props: {
		script_id: 'string',
		script_arguments: 'array',
		script_runas: 'string',
	},
  children: {
    //script: Script
  }
})

export const Scraper = Schema.extend({
  urlRoot: urlRoot,
  props: {
    url: 'string',
    method: 'string',
    body: 'string',
    parser: 'string',
    pattern: 'string',
    gzip: 'boolean',
    json: 'boolean',
    status_code: 'number',
    timeout: 'number',
  }
})

export const Collection = AppCollection.extend({
  url: urlRoot,
  model: function (attrs, options) {
    if ( /ScraperTaskTemplate/.test(attrs._type) === true ) {
      return new Scraper(attrs,options)
    } else {
      return new Script(attrs,options)
    }
  }
})
