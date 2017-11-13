import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import isURL from 'validator/lib/isURL'
import isMongoId from 'validator/lib/isMongoId'

//import { Model as Host } from 'models/host'

const ScriptJob = require('./job').ScriptJob
const ScraperJob = require('./job').ScraperJob
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
    }
  },
  children: {
    //host: Host,
    lastjob: ScriptJob,
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
    }
  },
  children: {
    //host: Host,
    lastjob: ScraperJob,
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

const Collection = AppCollection.extend({
  comparator: 'name',
  url: urlRoot,
  model (attrs, options) {
    if ( /ScraperTask/.test(attrs._type) === true ) {
      return new Scraper(attrs,options)
    } else {
      return new Script(attrs,options)
    }
  },
  isModel (model) {
    return model instanceof Scraper || model instanceof Script
  }
})

exports.Scraper = Scraper
exports.Script = Script
exports.Collection = Collection

exports.Factory = function (data) {
  if (data.type == 'script') {
    return new Script(data)
  }
  if (data.type == 'scraper') {
    return new Scraper(data)
  }
  throw new Error(`unrecognized type ${data.type}`)
}
