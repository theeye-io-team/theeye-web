import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

const Script = require('models/file/script').Model
const Events = require('models/event').Collection
const config = require('config')

const Schema = AppModel.extend({
	props: {
    id: 'string',
		user_id: 'string',
		customer_id: 'string',
		public: 'boolean',
		tags: 'array',
		name: 'string',
		description: ['string',false,''],
		acl: 'array',
		secret: 'string',
		grace_time: 'number',
		type: 'string',
    _type: 'string' // discriminator
	},
	collections: {
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

const urlRoot = `${config.api_url}/task-template`

const ScriptTask = Schema.extend({
  urlRoot: urlRoot,
	props: {
		script_id: 'string',
		script_arguments: 'array',
		script_runas: 'string',
	},
  children: {
    script: Script
  }
})

const ScraperTask = Schema.extend({
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

const Collection = AppCollection.extend({
  url: urlRoot,
  model: function (attrs, options) {
    if ( /ScraperTaskTemplate/.test(attrs._type) === true ) {
      return new ScraperTask(attrs,options)
    } else {
      return new ScriptTask(attrs,options)
    }
  }
})

exports.Collection = Collection
exports.Scraper = ScraperTask
exports.Script = ScriptTask
