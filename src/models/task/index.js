import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import isURL from 'validator/lib/isURL'
import isMongoId from 'validator/lib/isMongoId'
import TaskConstants from 'constants/task'

//import { Model as Host } from 'models/host'

const JobModel = require('models/job')
const ScriptTemplate = require('./template').Script
const ScraperTemplate = require('./template').Scraper
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
const Script = ScriptTemplate.extend({
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
    //host: Host,
    lastjob: JobModel.ScriptJob,
    template: ScriptTemplate,
  },
  serialize () {
    var serial = ScriptTemplate.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    serial.host = this.host_id
    serial.script = this.script_id
    delete serial.lastjob
    return serial
  }
})

const Scraper = ScraperTemplate.extend({
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
    //host: Host,
    lastjob: JobModel.ScraperJob,
    template: ScraperTemplate,
  },
  serialize () {
    var serial = ScraperTemplate.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    serial.host = this.host_id
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

  let err = new Error(`unrecognized type ${attrs.type}`)
  throw err
}

const Collection = AppCollection.extend({
  comparator: 'name',
  url: urlRoot,
  model: Factory,
  isModel (model) {
    return model instanceof Scraper || model instanceof Script
  }
})

exports.Scraper = Scraper
exports.Script = Script
exports.Collection = Collection
exports.Factory = Factory
