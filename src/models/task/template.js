import AppCollection from 'lib/app-collection'
import * as FIELD from 'constants/field'
import Schema from './schema'

import { Model as Script } from 'models/file/script'

/**
 * @param {Array} args
 * @return {Array}
 */
const filterScriptArguments = (args) => {
  const parsed = []
  if (Array.isArray(args)) {
    if (args.length > 0) {
      args.forEach((arg, idx) => {
        if (typeof arg === 'string') {
          parsed.push({
            id: idx,
            order: idx,
            type: FIELD.TYPE_FIXED,
            value: arg,
            label: `FixedArg${idx}`,
            help: 'This value is predefined and cannot be modified.',
            required: true,
            readonly: true
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
    Schema.prototype.initialize.apply(this, arguments)
    this.type = 'script'
  },
  parse () {
    var attrs = Schema.prototype.parse.apply(this, arguments)

    if (attrs.script_arguments && !attrs.task_arguments) {
      // convert old script_arguments into task_arguments
      if (Array.isArray(attrs.script_arguments) && attrs.script_arguments.length > 0) {
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
    script: Script
  },
  /**
   * transform into plain data before submit
   */
  serialize () {
    var serial = Schema.prototype.serialize.apply(this, arguments)
    serial.script = this.script ? this.script.id : null
    // serial.script_arguments = this.task_arguments.serialize() // transform collection into array
    // delete serial.task_arguments
    return serial
  }
})

const ScraperTask = Schema.extend({
  initialize () {
    Schema.prototype.initialize.apply(this, arguments)
    this.type = 'scraper'
  },
  props: {
    // url: 'string', /// WARNING !!! replace server url to scraper_url
    remote_url: 'string',
    method: 'string',
    body: 'string',
    parser: 'string',
    pattern: 'string',
    gzip: 'boolean',
    json: 'boolean',
    status_code: 'number'
  },
  parse () {
    var attrs = Schema.prototype.parse.apply(this, arguments)
    attrs.remote_url = attrs.url
    delete attrs.url
    return attrs
  },
  serialize () {
    const data = Schema.prototype.serialize.apply(this, arguments)
    data.url = data.remote_url
    return data
  }
})

const ApprovalTask = Schema.extend({
  initialize () {
    Schema.prototype.initialize.apply(this, arguments)
    this.type = 'approval'
  },
  props: {
    approvers: ['array', false, () => { return [] }],
    approval_message: ['string', false, ''],
    success_enabled: ['boolean', true, true],
    failure_enabled: ['boolean', true, true],
    cancel_enabled: ['boolean', true, true],
    ignore_enabled: ['boolean', true, true],
    success_label: ['string', true, 'Approve'],
    failure_label: ['string', true, 'Reject'],
    cancel_label: ['string', true, 'Cancel'],
    ignore_label: ['string', true, 'Ignore']
  },
  isApprover (user) {
    const userid = user.id
    if (!this.approvers) { return false }
    return this.approvers.indexOf(userid) !== -1
  }
})

const DummyTask = Schema.extend({
  initialize () {
    Schema.prototype.initialize.apply(this, arguments)
    this.type = 'dummy'
  }
})

const NotificationTask = Schema.extend({
  initialize () {
    Schema.prototype.initialize.apply(this, arguments)
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
    if (/ScraperTaskTemplate/.test(attrs._type) === true) {
      return new ScraperTask(attrs, options)
    } else {
      return new ScriptTask(attrs, options)
    }
  }
})

export { Collection, ScraperTask as Scraper, ScriptTask as Script, ApprovalTask as Approval, DummyTask as Dummy, NotificationTask as Notification }
