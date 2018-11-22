import App from 'ampersand-app'
import AppCollection from 'lib/app-collection'
import FIELD from 'constants/field'
import Schema from './schema'

const Script = require('models/file/script').Model
const Events = require('models/event').Collection
const config = require('config')

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
    approvers: ['array', false, () => { return [] }]
  },
  isApprover (userid) {
    if (!this.approvers) { return false }
    return this.approvers.indexOf(userid) !== -1
  }
})

const DummyTask = Schema.extend({
  initialize () {
    Schema.prototype.initialize.apply(this,arguments)
    this.type = 'dummy'
  }
})

const NotificationTask = Schema.extend({
  initialize () {
    Schema.prototype.initialize.apply(this,arguments)
    this.type = 'notification'
  },
  props: {
    subject: 'string',
    body: 'string',
    notificationTypes: ['object', false, () => {
      return {
        push: true,
        email: false,
        socket: false,
        desktop: false
      }
    }],
    recipients: 'array'
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
exports.Dummy = DummyTask
exports.Notification = NotificationTask
