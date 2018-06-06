import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import isURL from 'validator/lib/isURL'
import isMongoId from 'validator/lib/isMongoId'
import TaskConstants from 'constants/task'
import LIFECYCLE from 'constants/lifecycle'

//import { Model as Host } from 'models/host'

const Job = require('models/job')
const Template = require('./template')
const config = require('config')

const urlRoot = `${config.api_url}/task`

const formattedTags = () => {
  return {
    deps: ['name','hostname','type','description','acl','tags'],
    fn () {
      return [
        'name=' + this.name,
        'hostname=' + this.hostname,
        'type=' + this.type,
        'description=' + this.description,
        'acl=' + this.acl,
      ].concat(this.tags)
    }
  }
}

// add host and template to both script and scraper tasks
const Script = Template.Script.extend({
  urlRoot: urlRoot,
  props: {
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    lastjob_id: 'string'
  },
  derived: {
    formatted_tags: formattedTags(),
    canExecute: {
      deps: ['script_id','host_id'],
      fn () {
        return isMongoId(this.script_id || '') && isMongoId(this.host_id || '')
      }
    },
    canBatchExecute: {
      deps: ['lastjob', 'hasDinamicArguments'],
      fn () {
        return !(LIFECYCLE.inProgress(this.lastjob.lifecycle) || this.hasDinamicArguments)
      }
    },
    hasTemplate: {
      deps: ['template_id'],
      fn () {
        return Boolean(this.template_id) === true
      }
    },
    summary: {
      deps: ['hostname','name'],
      fn () {
        return `[${this.hostname}] script task ${this.name}`
      }
    }
  },
  children: {
    lastjob: Job.ScriptJob,
    template: Template.Script,
  },
  serialize () {
    var serial = Template.Script.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    serial.host = this.host_id
    serial.script = this.script_id
    delete serial.lastjob
    return serial
  }
})

const Scraper = Template.Scraper.extend({
  urlRoot: urlRoot,
  props: {
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    lastjob_id: 'string'
  },
  derived: {
    formatted_tags: formattedTags(),
    canExecute: {
      deps: ['remote_url','host_id'],
      fn () {
        const url = this.remote_url || ''

        const isurl = /localhost/.test(url) || isURL(url, {
          protocols: ['http','https'],
          require_protocol: true
        })
        return isurl && isMongoId(this.host_id || '')
      }
    },
    hasTemplate: {
      deps: ['template_id'],
      fn () {
        return Boolean(this.template_id) === true
      }
    },
    summary: {
      deps: ['hostname','name'],
      fn () {
        return `[${this.hostname}] web check task ${this.name}`
      }
    }
  },
  children: {
    lastjob: Job.ScraperJob,
    template: Template.Scraper,
  },
  serialize () {
    var serial = Template.Scraper.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    serial.host = this.host_id
    delete serial.lastjob
    return serial
  }
})

const Approval = Template.Approval.extend({
  urlRoot,
  props: {
    template_id: 'string',
    lastjob_id: 'string'
  },
  derived: {
    formatted_tags: () => {
      return {
        deps: ['name','type','description','acl','tags'],
        fn () {
          return [
            'name=' + this.name,
            'type=' + this.type,
            'description=' + this.description,
            'acl=' + this.acl,
          ].concat(this.tags)
        }
      }
    },
    canExecute: {
      deps: [],
      fn () {
        return true
      }
    },
    hasTemplate: {
      deps: ['template_id'],
      fn () {
        return Boolean(this.template_id) === true
      }
    },
    summary: {
      deps: ['name'],
      fn () {
        return `approval task ${this.name}`
      }
    }
  },
  children: {
    lastjob: Job.ApprovalJob,
    template: Template.Approval,
  },
  serialize () {
    var serial = Template.Approval.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    delete serial.lastjob
    return serial
  }
})

const Factory = function (attrs, options={}) {
  if (attrs.isCollection) return

  if (attrs.type == TaskConstants.TYPE_SCRIPT) {
    return new Script(attrs, options)
  }

  if (attrs.type == TaskConstants.TYPE_SCRAPER) {
    return new Scraper(attrs, options)
  }

  if (attrs.type == TaskConstants.TYPE_APPROVAL) {
    return new Approval(attrs, options)
  }

  let err = new Error(`unrecognized type ${attrs.type}`)
  throw err
}

const Collection = AppCollection.extend({
  comparator: 'name',
  url: urlRoot,
  model: Factory,
  isModel (model) {
    let isModel = (
      model instanceof Scraper ||
      model instanceof Script ||
      model instanceof Approval
    )
    return isModel
  }
})

exports.Scraper = Scraper
exports.Script = Script
exports.Approval = Approval
exports.Collection = Collection
exports.Factory = Factory
