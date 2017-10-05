//import AppModel from 'lib/app-model'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import isURL from 'validator/lib/isURL'
import isMongoId from 'validator/lib/isMongoId'
import LIFECYCLE from 'constants/lifecycle'

//import { Model as Host } from 'models/host'

const ScriptTemplate = require('./template').Script
const ScraperTemplate = require('./template').Scraper
const config = require('config')

const urlRoot = `${config.api_url}/task`

const JobResult = State.extend({
  props: {
    id: 'string',
    user_id: 'string',
    task_id: 'string',
    host_id: 'string',
    script_id: 'string',
    script_arguments: 'array',
    customer_id: 'string',
    customer_name: 'string',
    //script: 'object', // embedded
    //task: 'object', // embedded
    //host: 'object',
    //user: 'object',
    name: 'string',
    notify: 'boolean',
    state: 'string',
    lifecycle: 'string',
    result: ['object',false,null],
    creation_date: 'date',
    last_update: 'date',
    event: 'any',
    event_id: 'string'
  },
  inProgress () {
    return LIFECYCLE.inProgress(this.lifecycle)
  }
})

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
    }
  },
  children: {
    //host: Host,
    lastjob: JobResult,
    template: ScriptTemplate,
  },
  serialize () {
    var serial = ScriptTemplate.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
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
      deps: ['url','host_id'],
      fn () {
        const url = this.url || ''

        const isurl = /localhost/.test(url) || isURL(url, {
          protocols: ['http','https'],
          require_protocol: true
        })
        return isurl && isMongoId(this.host_id || '')
      }
    }
  },
  children: {
    //host: Host,
    lastjob: JobResult,
    template: ScraperTemplate,
  },
  serialize () {
    var serial = ScraperTemplate.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    return serial
  }
})

const Collection = AppCollection.extend({
  comparator: 'name',
  url: urlRoot,
  model: function (attrs, options) {
    if ( /ScraperTask/.test(attrs._type) === true ) {
      return new Scraper(attrs,options)
    } else {
      return new Script(attrs,options)
    }
  }
})

exports.Scraper = Scraper
exports.Script = Script
exports.Collection = Collection
