//import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

//import { Model as Host } from 'models/host'

import { Script as ScriptTemplate } from './template'
import { Scraper as ScraperTemplate } from './template'

const urlRoot = '/api/task'

// add host and template to both script and scraper tasks
export const Script = ScriptTemplate.extend({
  urlRoot: urlRoot,
  props: {
    host_id: 'string',
    template_id: 'string',
  },
  children: {
    //host: Host,
    template: ScriptTemplate,
  },
  serialize (options) {
    var serial = ScriptTemplate.prototype.serialize.call(this,options)
    serial.template = this.template ? this.template.id : null
    return serial
  }
})

export const Scraper = ScraperTemplate.extend({
  urlRoot: urlRoot,
  props: {
    host_id: 'string',
    template_id: 'string',
  },
  children: {
    //host: Host,
    template: ScraperTemplate,
  },
  serialize (options) {
    var serial = ScraperTemplate.prototype.serialize.call(this,options)
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
