import App from 'ampersand-app'
import AppCollection from 'lib/app-collection'
import isURL from 'validator/lib/isURL'
import isMongoId from 'validator/lib/isMongoId'
import * as TaskConstants from 'constants/task'
import * as LIFECYCLE from 'constants/lifecycle'
import Schema from './schema'

//import { Model as Host } from 'models/host'

import * as Template from './template'
import config from 'config'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/task`
}

const formattedTags = () => {
  return {
    deps: [
      'name','hostname','type',
      'acl','tags',
      'hasSchedules','inProgressJobs','hasTemplate',
      'canExecute'
    ],
    /**
     * @return {Array}
     */
    fn () {
      return [
        this.name,
        this.type,
        (this.hostname || undefined),
        (this.canExecute ? 'valid' : 'invalid'),
        (this.hasSchedules ? 'scheduled' : undefined),
        (this.inProgressJobs ? 'running' : undefined)
      ].concat(this.acl, this.tags)
    }
  }
}

// add host and template to both script and scraper tasks
const Script = Template.Script.extend({
  urlRoot,
  props: {
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    multitasking: ['boolean', false, true],
    table_view: ['boolean', false, false],
    env: 'object'
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
      deps: ['hasDynamicArguments'],
      fn () {
        return !this.hasDynamicArguments
      }
    },
    hasTemplate: {
      deps: ['template_id'],
      fn () {
        return Boolean(this.template_id) === true
      }
    },
    summary: {
      deps: ['hostname','name','tags'],
      fn () {
        return this.buildTaskSummary()
      }
    }
  },
  children: {
    template: Template.Script
  },
  serialize () {
    var serial = Template.Script.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    serial.host = this.host_id
    serial.script = this.script_id
    return serial
  },
})

const Scraper = Template.Scraper.extend({
  urlRoot,
  props: {
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    multitasking: ['boolean',false,true]
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
      deps: ['hostname','name','tags'],
      fn () {
        return this.buildTaskSummary()
      }
    }
  },
  children: {
    template: Template.Scraper,
  },
  serialize () {
    var serial = Template.Scraper.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    serial.host = this.host_id
    return serial
  },
})

const Approval = Template.Approval.extend({
  urlRoot,
  props: {
    template_id: 'string',
    table_view: ['boolean', false, false]
  },
  derived: {
    formatted_tags: formattedTags(),
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
      deps: ['name','tags'],
      fn () {
        return this.buildTaskSummary()
      }
    }
  },
  children: {
    template: Template.Approval,
  },
  serialize () {
    var serial = Template.Approval.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    return serial
  },
})

const Dummy = Template.Dummy.extend({
  urlRoot,
  props: {
    template_id: 'string'
  },
  derived: {
    formatted_tags: formattedTags(),
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
      deps: ['name','tags'],
      fn () {
        return this.buildTaskSummary()
      }
    }
  },
  children: {
    template: Template.Dummy,
  },
  serialize () {
    var serial = Template.Dummy.prototype.serialize.apply(this,arguments)
    serial.template = this.template ? this.template.id : null
    return serial
  }
})

const Notification = Template.Notification.extend({
  urlRoot,
  props: {
    template_id: 'string'
  },
  derived: {
    formatted_tags: formattedTags(),
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
      deps: ['name','tags'],
      fn () {
        return this.buildTaskSummary()
      }
    }
  },
  children: {
    template: Template.Notification,
  },
  serialize () {
    var serial = Template.Notification.prototype.serialize.apply(this, arguments)
    serial.template = this.template ? this.template.id : null
    return serial
  }
})

const TaskFactory = function (attrs, options={}) {
  const store = App.state.tasks

  if (attrs.isCollection) { return attrs }
  if (attrs.isState) { return attrs } // already constructed
  let model

  if (attrs.id) {
    model = store.get(attrs.id)
    if (model) { return model }
  }

  const createModel = () => {
    let type = attrs.type
    let model
    switch (type) {
      case TaskConstants.TYPE_SCRIPT:
        model = new Script(attrs, options)
        break;
      case TaskConstants.TYPE_SCRAPER:
        model = new Scraper(attrs, options)
        break;
      case TaskConstants.TYPE_APPROVAL:
        model = new Approval(attrs, options)
        break;
      case TaskConstants.TYPE_DUMMY:
        model = new Dummy(attrs, options)
        break;
      case TaskConstants.TYPE_NOTIFICATION:
        model = new Notification(attrs, options)
        break;
      default:
        let err = new Error(`unrecognized type ${type}`)
        throw err
        break;
    }
    return model
  }

  model = createModel()
  if (options.collection !== store && !model.isNew()) {
    store.add(model, {merge:true})
  }
  return model
}

const Collection = AppCollection.extend({
  comparator: 'name',
  url: urlRoot,
  model: TaskFactory,
  isModel (model) {
    let isModel = (
      model instanceof Scraper ||
      model instanceof Script ||
      model instanceof Approval ||
      model instanceof Dummy ||
      model instanceof Notification
    )
    return isModel
  }
})

export const Task = Schema.extend({
  session: {
    _all: 'object' // keep properties returned by the server as is
  },
  urlRoot,
  mutate () {
    return new TaskFactory(this._all)
  },
  parse (attrs) {
    this._all = attrs
    return attrs
  }
})

const Group = Schema.extend({
  initialize (attrs) {
    Schema.prototype.initialize.apply(this,arguments)
    this.type = 'group'
    this._type = 'TaskGroup'

    //this.listenToAndRun(this.submodels, 'change:inProgressJobs', () => {
    //  this.inProgressJobs = this.submodels.models
    //    .map(model => model.inProgressJobs)
    //    .reduce((count, curr) => count + curr, 0)
    //})
  },
  collections: {
    submodels: Collection
  },
  derived: {
    formatted_tags: formattedTags()
  },
  props: {
    //inProgressJobs: ['number', false, 0],
    groupby: ['string'],
    canExecute: ['boolean', false, true]
  }
})

export { Scraper, Script, Approval, Dummy, Notification, Collection, TaskFactory as Factory, Group }
