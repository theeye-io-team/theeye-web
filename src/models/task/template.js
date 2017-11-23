import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import AmpersandCollection from 'ampersand-collection'
import FIELD from 'constants/field'

const DinamicArgument = require('./dinamic-argument').DinamicArgument
const Script = require('models/file/script').Model
const Events = require('models/event').Collection
const config = require('config')

const ScheduleCollection = require('models/schedule').Collection

const TaskArguments = AmpersandCollection.extend({
  mainIndex: 'id',
  indexes: ['label','order'],
  model: DinamicArgument
})

const Schema = AppModel.extend({
  idAttribute: 'id',
	props: {
    id: 'string',
		user_id: 'string',
		customer_id: 'string',
		public: 'boolean',
		name: 'string',
		description: ['string',false,''],
		acl: 'array',
		secret: 'string',
		grace_time: 'number',
		type: 'string',
    // empty tags and triggers
		tags: ['array',false, () => { return [] }],
		triggers: ['array',false, () => { return [] }],
    //_id: 'string',
    _type: 'string', // discriminator
    hasSchedules: ['boolean', true, false]
	},
	collections: {
		//triggers: Events,
		taskArguments: TaskArguments,
    schedules: ScheduleCollection
	},
  initialize: function () {
    this.listenToAndRun(this.schedules, 'reset sync remove add', () => {
      this.hasSchedules = this.schedules.length > 0
    })
  },
  serialize (options) {
    var serial = AppModel.prototype.serialize.call(this, options)
    if (!this.triggers) {
      serial.triggers = []
    } else {
      serial.triggers = this.triggers
    }

    return serial
  }
})

/**
 * @param {Array} args
 * @return {Array}
 */
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

    //this.listenToAndRun(this,'change:script_arguments',() => {
    //  // re-assign existent script_arguments to taskArguments
    //  if (!this.isNew() && this.script_arguments.length>0) {
    //    let args = filterScriptArguments(this.script_arguments)
    //    this.taskArguments.set(args)
    //  }
    //})

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
  parse (attrs) {
    // convert script_arguments into taskArguments
    if (Array.isArray(attrs.script_arguments)) {
      if (attrs.script_arguments.length>0) {
        attrs.taskArguments = filterScriptArguments(attrs.script_arguments)
      } else {
        attrs.taskArguments = []
      }
    }
    return attrs
  },
	props: {
		script_id: 'string',
    // this attribute comes from the server and need to be filtered and parsed
		//script_arguments: ['array',false, () => { return [] }],
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
  initialize () {
    Schema.prototype.initialize.apply(this,arguments)
    this.type = 'scraper'
  },
  props: {
    //url: 'string', /// WARNING !!! replace server url to scraper_url
    remote_url: 'string',
    method: 'string',
    body: 'string',
    parser: 'string',
    pattern: 'string',
    gzip: 'boolean',
    json: 'boolean',
    status_code: 'number',
    timeout: 'number',
  },
  parse (args) {
    args.remote_url = args.url
    delete args.url
    return args
  },
  serialize () {
    let data = Schema.prototype.serialize.apply(this,arguments)
    data.url = data.remote_url
    return data
  }
})

const Collection = AppCollection.extend({
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
