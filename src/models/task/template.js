import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import AmpersandCollection from 'ampersand-collection'
import FIELD from 'constants/field'

const DinamicArgument = require('./dinamic-argument').DinamicArgument
const Script = require('models/file/script').Model
const Events = require('models/event').Collection
const config = require('config')

//const urlRoot = `${config.api_url}/task-template`
const TaskArguments = AmpersandCollection.extend({
  model: DinamicArgument
})

const Schema = AppModel.extend({
  idAttribute: 'id',
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
    //_id: 'string',
    _type: 'string' // discriminator
	},
	collections: {
		triggers: Events,
		taskArguments: TaskArguments
	},
  serialize (options) {
    var serial = AppModel.prototype.serialize.call(this,options)
    serial.triggers = this.triggers.map( trigger => {
      return trigger ? trigger.id : null
    })

    return serial
  }
})

const filterScriptArguments = (args) => {
  const parsed = []
  if (Array.isArray(args)) {
    if (args.length>0) {
      args.forEach((arg,idx) => {
        if (typeof arg == 'string') {
          parsed.push({
            id: idx,
            order: idx,
            type: FIELD.TYPE_FIXED,
            value: arg,
            label: `FixedArg${idx}`,
            help: 'This value is predefined and cannot be modified.',
            required: true,
            readonly: true,
          })
        } else {
          parsed.push(arg)
        }
      })
    }
  }
  return parsed
}

const ScriptTask = Schema.extend({
  initialize (attrs) {
    Schema.prototype.initialize.apply(this,arguments)

    this.type = 'script'

    this.listenToAndRun(this, 'change:script_arguments', () => {
      // re-assign
      let args = filterScriptArguments(this.script_arguments) 
      this.taskArguments.set(args)
    })

    this.listenToAndRun(this.taskArguments, 'add remove change reset sync', () => {
      this.hasDinamicArguments = Boolean(
        this.taskArguments.models.find(arg => {
          return arg.type && (
            arg.type===FIELD.TYPE_INPUT ||
            arg.type===FIELD.TYPE_SELECT
          )
        })
      )
    })
  },
  //urlRoot: urlRoot,
	props: {
		script_id: 'string',
    // this attribute comes from the server and need to be filtered and parsed
		script_arguments: ['array',false, () => { return [] }],
		script_runas: 'string'
	},
  session: {
    hasDinamicArguments: 'boolean'
  },
  children: {
    script: Script,
  },
  /**
   * transform into plain data before submit
   */
  serialize () {
    var serial = Schema.prototype.serialize.apply(this,arguments)
    serial.script = this.script ? this.script.id : null
    serial.script_arguments = this.taskArguments.serialize() // transform collection into array
    delete serial.taskArguments
    return serial
  }
})

const ScraperTask = Schema.extend({
  //urlRoot: urlRoot,
  initialize () {
    Schema.prototype.initialize.apply(this,arguments)
    this.type = 'scraper'
  },
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
  },
})

//const Collection = AppCollection.extend({
//  //url: urlRoot,
//  model: function (attrs, options) {
//    if ( /ScraperTaskTemplate/.test(attrs._type) === true ) {
//      return new ScraperTask(attrs,options)
//    } else {
//      return new ScriptTask(attrs,options)
//    }
//  }
//})
//exports.Collection = Collection

exports.Scraper = ScraperTask
exports.Script = ScriptTask
