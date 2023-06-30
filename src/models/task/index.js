import App from 'ampersand-app'
import AppCollection from 'lib/app-collection'
import isURL from 'validator/lib/isURL'
import isMongoId from 'validator/lib/isMongoId'
import * as TaskConstants from 'constants/task'
import * as LIFECYCLE from 'constants/lifecycle'
import Schema from './schema'
import { labels } from 'language'
import { Model as ScriptFile } from 'models/file/script'

//import { Model as Host } from 'models/host'

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
        (this.inProgressJobs ? 'running' : undefined),
        (this.hasTemplate ? `template ${this.template_id}` : undefined),
      ].concat(this.acl, this.tags)
    }
  }
}

// add host and template to both script and scraper tasks
const Script = Schema.extend({
  urlRoot,
  initialize (attrs) {
    Schema.prototype.initialize.apply(this, arguments)
    this.needAHost = true
    this.type = 'script'
  },
  props: {
    agent_logging: 'boolean',
    script_id: 'string',
    script_runas: 'string',
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    multitasking: ['boolean',false,true],
    env: 'object',
    _type: ['string',false,'ScriptTask']
  },
  derived: {
    formatted_tags: formattedTags(),
    canExecute: {
      deps: ['script','script_runas','script_id','host_id'],
      fn () {
        return (
          (
            isMongoId(this.script_id || '') ||
            this.script.data // the script is loaded but it was not persisted yet
          ) &&
          isMongoId(this.host_id || '') &&
          Boolean(this.script_runas)
        )
      }
    },
    missingConfiguration: {
      deps: ['script_id','script_runas','host_id','task_arguments','env'],
      fn () {
        const missing = []
        const addMissing = (name, values) => {
          missing.push({
            prop: name,
            label: labels[name],
            values
          })
        }

        if (!this.script_runas) {
          addMissing('script_runas')
        }

        if (!isMongoId(this.host_id || '')) {
          addMissing('host_id')
        }

        if (!isMongoId(this.script_id || '') && !this.script?.data) {
          addMissing('script_id')
        }

        const incmpArgs = this.task_arguments.getIncompleted()
        if (incmpArgs.length > 0) {
          addMissing('task_arguments', incmpArgs)
        }

        const incmpEnvs = []
        for (let name in this.env) {
          const value = this.env[name]
          if (value === '' || value === null || value === undefined) {
            incmpEnvs.push(name)
          }
        }

        if (incmpEnvs.length > 0) {
          addMissing('env', incmpEnvs)
        }

        return missing
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
    script: ScriptFile
  },
  serialize () {
    const serial = Schema.prototype.serialize.apply(this,arguments)

    if (this.script_id) {
      serial.script = this.script_id
    } else if (this.script && this.script.isNew()) { // is set but ID is not defined
      serial.script = this.script.serialize()
    }

    //serial.template = this.template ? this.template.id : null
    serial.host = this.host_id
    return serial
  }
})

const Scraper = Schema.extend({
  urlRoot,
  initialize () {
    Schema.prototype.initialize.apply(this, arguments)
    this.needAHost = true
    this.type = 'scraper'
  },
  props: {
    register_body: 'boolean',
    remote_url: 'string',
    method: 'string',
    body: 'string',
    parser: 'string',
    pattern: 'string',
    gzip: 'boolean',
    json: 'boolean',
    status_code: 'number',
    hostname: 'string',
    host_id: 'string',
    template_id: 'string',
    multitasking: ['boolean',false,true],
    _type: ['string',false,'ScraperTask']
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
    missingConfiguration: {
      deps: ['remote_url','host_id'],
      fn () {
        const missing = []
        const addMissing = (name, values) => {
          missing.push({
            prop: name,
            label: labels[name],
            values
          })
        }

        if (!isMongoId(this.host_id || '')) {
          addMissing('host_id')
        }

        const url = (this.remote_url || '')

        const isUrl = /localhost/.test(url) || isURL(url, {
          protocols: ['http','https'],
          require_protocol: true
        })

        if (!isUrl) {
          addMissing('remote_url')
        }

        return missing
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
  parse () {
    const attrs = Schema.prototype.parse.apply(this, arguments)
    if (attrs.url) {
      attrs.remote_url = attrs.url
      delete attrs.url
    }
    return attrs
  },
  serialize () {
    const data = Schema.prototype.serialize.apply(this, arguments)
    data.url = data.remote_url
    //serial.template = this.template ? this.template.id : null
    data.host = this.host_id
    return data
  }
})

const Approval = Schema.extend({
  urlRoot,
  initialize () {
    Schema.prototype.initialize.apply(this, arguments)
    this.type = 'approval'
  },
  props: {
    approvers: ['array', false, () => { return [] }],
    approvals_target: ['string', false, ''],
    approval_message: ['string', false, ''],
    success_enabled: ['boolean', true, true],
    failure_enabled: ['boolean', true, true],
    cancel_enabled: ['boolean', true, true],
    ignore_enabled: ['boolean', true, true],
    success_label: ['string', true, 'Approve'],
    failure_label: ['string', true, 'Reject'],
    cancel_label: ['string', true, 'Cancel'],
    ignore_label: ['string', true, 'Ignore'],
    template_id: 'string',
    _type: ['string',false,'ApprovalTask'],
  },
  derived: {
    formatted_tags: formattedTags(),
    canExecute: {
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
  isApprover (user) {
    const userid = user.id
    if (!this.approvers) { return false }
    return this.approvers.indexOf(userid) !== -1
  }
})

const Dummy = Schema.extend({
  urlRoot,
  initialize () {
    Schema.prototype.initialize.apply(this, arguments)
    this.type = 'dummy'
  },
  props: {
    template_id: 'string',
    _type: ['string',false,'DummyTask']
  },
  derived: {
    formatted_tags: formattedTags(),
    canExecute: {
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
  }
})

const Notification = Schema.extend({
  urlRoot,
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
    recipients: 'array',
    template_id: 'string',
    _type: ['string',false,'NotificationTask']
  },
  derived: {
    formatted_tags: formattedTags(),
    canExecute: {
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
  serialize () {
    const serial = Schema.prototype.serialize.apply(this, arguments)
    //serial.template = this.template ? this.template.id : null
    return serial
  }
})

const TaskFactory = function (attrs, options = {}) {
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
      case TaskConstants.TYPE_NOTIFICATION:
        model = new Notification(attrs, options)
        break;
      case TaskConstants.TYPE_DUMMY:
      default:
        model = new Dummy(attrs, options)
        break;
    }
    return model
  }

  model = createModel()
  if (options.collection !== store && !model.isNew() && options.store !== false) {
    store.add(model, { merge: true })
  }
  return model
}

const Collection = AppCollection.extend({
  url: urlRoot,
  comparator: 'name',
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
  urlRoot,
  session: {
    _all: 'object' // keep properties returned by the server as is
  },
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
