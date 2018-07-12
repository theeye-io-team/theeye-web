import App from 'ampersand-app'
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
    workflow_id: 'string',
    public: 'boolean',
    name: 'string',
    description: ['string',false,''],
    acl: 'array',
    secret: 'string',
    grace_time: 'number',
    type: 'string',
    source_model_id: 'string',
    // empty tags and triggers
    tags: ['array',false, () => { return [] }],
    triggers: ['array',false, () => { return [] }],
    //_id: 'string',
    _type: 'string', // discriminator
    hasSchedules: ['boolean', true, false]
  },
  derived: {
    hasWorkflow: {
      deps: ['workflow_id'],
      fn () {
        return Boolean(this.workflow_id) === true
      }
    }
  },
  session: {
    hasDinamicArguments: 'boolean'
  },
  collections: {
    //triggers: Events,
    task_arguments: TaskArguments,
    schedules: ScheduleCollection
  },
  initialize: function () {
    AppModel.prototype.initialize.apply(this,arguments)

    this.listenToAndRun(this.schedules, 'reset sync remove add', () => {
      this.hasSchedules = this.schedules.length > 0
    })

    this.listenToAndRun(this.task_arguments, 'add remove change reset sync', () => {
      this.hasDinamicArguments = Boolean(
        this.task_arguments.models.find(arg => {
          return arg.type && (
            arg.type===FIELD.TYPE_INPUT ||
            arg.type===FIELD.TYPE_SELECT ||
            arg.type===FIELD.TYPE_DATE ||
            arg.type===FIELD.TYPE_FILE ||
            arg.type===FIELD.TYPE_REMOTE_OPTIONS
          )
        })
      )
    })
  },
  serialize (options) {
    var serial = AppModel.prototype.serialize.call(this, options)
    if (!this.triggers) {
      serial.triggers = []
    } else {
      serial.triggers = this.triggers
        .filter(eve => {
          if (!eve) return false
          if (typeof eve === 'object') {
            return Boolean(!eve._id)
          }
          return typeof eve === 'string'
        })
        .map(eve => {
          if (typeof eve === 'object') {
            return eve._id
          } else return eve // this is the id string
        })
    }

    return serial
  },
  hostResource () {
    let col = App.state.resources
    let host = col.models.find(resource => {
      return resource.host_id == this.host_id && resource.type == 'host'
    })
    return host
  },
  hostIsReporting () {
    let host = this.hostResource()
    if (!host) return true // I cannot determine, so go ahead
    return host.state === 'normal'
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
  },
  parse () {
    var attrs = Schema.prototype.parse.apply(this,arguments)
    // convert old script_arguments into task_arguments
    if (Array.isArray(attrs.script_arguments)) {
      if (attrs.script_arguments.length>0) {
        attrs.task_arguments = filterScriptArguments(attrs.script_arguments)
      } else {
        attrs.task_arguments = []
      }
    }
    return attrs
  },
  props: {
    script_id: 'string',
    script_runas: 'string'
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
    //serial.script_arguments = this.task_arguments.serialize() // transform collection into array
    //delete serial.task_arguments
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
  parse () {
    var attrs = Schema.prototype.parse.apply(this,arguments)
    attrs.remote_url = attrs.url
    delete attrs.url
    return attrs
  },
  serialize () {
    let data = Schema.prototype.serialize.apply(this,arguments)
    data.url = data.remote_url
    return data
  }
})

const ApprovalTask = Schema.extend({
  initialize () {
    Schema.prototype.initialize.apply(this,arguments)
    this.type = 'approval'
  },
  props: {
    approver_id: 'string'
  },
  parse () {
    var attrs = Schema.prototype.parse.apply(this,arguments)
    attrs.remote_url = attrs.url
    delete attrs.url
    return attrs
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
exports.Approval = ApprovalTask
//exports.Notification = NotificationTask
