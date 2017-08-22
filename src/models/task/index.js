//import AppModel from 'lib/app-model'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'

//import { Model as Host } from 'models/host'

import { Script as ScriptTemplate } from './template'
import { Scraper as ScraperTemplate } from './template'

const urlRoot = '/api/task'

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
    result: ['object',false,null],
    creation_date: 'date',
    last_update: 'date',
    event: 'object',
    event_id: 'string'
  },
  derived: {
    success: {
      deps: ['state'],
      fn () {
        return this.state === 'success'
      }
    }
  }
})

const formattedTags = () => {
  return {
    deps: ['name','hostname','type','description','acl','tags'],
    fn () {
      return [
        'task',
        this.name,
        this.hostname,
        this.type,
        this.description,
        this.acl,
      ].concat(this.tags)
    }
  }
}

// add host and template to both script and scraper tasks
export const Script = ScriptTemplate.extend({
  urlRoot: urlRoot,
  props: {
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    lastjob_id: 'string'
  },
  derived: {
    formatted_tags: formattedTags()
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

export const Scraper = ScraperTemplate.extend({
  urlRoot: urlRoot,
  props: {
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    lastjob_id: 'string'
  },
  derived: {
    formatted_tags: formattedTags()
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

export const Collection = AppCollection.extend({
  url: urlRoot,
  model: function (attrs, options) {
    if ( /ScraperTask/.test(attrs._type) === true ) {
      return new Scraper(attrs,options)
    } else {
      return new Script(attrs,options)
    }
  }
})
