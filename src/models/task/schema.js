import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AmpersandCollection from 'ampersand-collection'
import { DynamicArgument } from './dynamic-argument'
import { Collection as ScheduleCollection } from 'models/schedule'
import { Collection as TagCollection } from 'models/tag'

import * as FIELD from 'constants/field'
import * as TaskConstants from 'constants/task'

const TaskArguments = AmpersandCollection.extend({
  mainIndex: 'id',
  indexes: ['label', 'order'],
  model: DynamicArgument,
  getIncompleted () {
    return this.models.filter(arg => {
      return Boolean(arg.type === FIELD.TYPE_FIXED && !arg.value)
    })
  }
})

const Schema = AppModel.extend({
  idAttribute: 'id',
  props: {
    id: 'string',
    version: 'number',
    fingerprint: 'string',
    user_id: 'string',
    customer_id: 'string',
    workflow_id: 'string',
    public: 'boolean',
    name: 'string',
    description: 'string',
    acl: 'array',
    secret: 'string',
    grace_time: 'number',
    type: 'string',
    source_model_id: 'string',
    // empty tags and triggers
    tags: ['array', false, () => { return [] }],
    triggers: ['array', false, () => { return [] }],
    timeout: 'number',
    //_id: 'string',
    _type: 'string', // discriminator
    show_result: 'boolean',
    user_inputs: 'boolean',
    user_inputs_members: 'array',
    arguments_type: ['string', false],
    allows_dynamic_settings: ['boolean', false],
    assigned_users: ['array', false, () => { return [] }],
    cancellable: ['boolean', false, true]
  },
  derived: {
    hasWorkflow: {
      deps: ['workflow_id'],
      fn () {
        return Boolean(this.workflow_id) === true
      }
    },
    hasOnHoldExecution: {
      deps: ['grace_time'],
      fn () {
        return this.grace_time > 0
      }
    },
    missingConfiguration: {
      fn () {
        return []
      }
    }
  },
  session: {
    credentials: ['object', false, null],
    hasDynamicArguments: 'boolean',
    alreadyFetched: ['boolean', false, false],
    inProgressJobs: ['number',false,0],
    last_execution: 'date',
    tagsCollection: 'collection',
    hasSchedules: ['boolean', true, false],
    hasDisabledSchedules: ['boolean', true, false],
  },
  collections: {
    //triggers: Events,
    task_arguments: TaskArguments,
    schedules: ScheduleCollection,
    jobs: function (models, options) {
      options.child_of = options.parent
      return new App.Models.Job.Collection(models, options)
    }
  },
  initialize () {
    AppModel.prototype.initialize.apply(this,arguments)

    this.tagsCollection = new TagCollection([])

    this.listenToAndRun(this, 'change:tags', () => {
      if (Array.isArray(this.tags)) {
        let tags = this.tags.map((tag, index) => {
          return {_id: (index + 1).toString(), name: tag}
        })
        tags = tags.slice(0, 3)
        this.tagsCollection.set(tags)
      }
    })

    this.listenToAndRun(this.schedules, 'change reset sync remove add', () => {
      this.hasSchedules = (this.schedules.length > 0)
      if (this.hasSchedules) {
        this.hasDisabledSchedules = (
          this.schedules.find(sch => sch.disabled === true) !== undefined
        )
      }
    })

    this.listenToAndRun(this.jobs, 'add change sync reset remove', () => {
      let inProgressJobs = this.jobs.filter(job => job.inProgress)
      if (inProgressJobs.length > 0) {
        this.inProgressJobs = inProgressJobs.length
      } else {
        this.inProgressJobs = 0
      }
    })

    this.listenToAndRun(this.jobs, 'add change sync reset remove', () => {
      if (this.jobs.length===0) { return }
      let dates = this.jobs.map(e => e.creation_date)
      const last = Math.max.apply(null, dates)
      if (typeof last === 'date') {
        this.last_execution = last
      }
    })

    this.listenToAndRun(this.task_arguments, 'add remove change reset sync', () => {
      this.hasDynamicArguments = Boolean(
        this.task_arguments.models.find(arg => {
          return arg.type && arg.type !== FIELD.TYPE_FIXED
            //arg.type===FIELD.TYPE_INPUT ||
            //arg.type===FIELD.TYPE_SELECT ||
            //arg.type===FIELD.TYPE_DATE ||
            //arg.type===FIELD.TYPE_FILE ||
            //arg.type===FIELD.TYPE_REMOTE_OPTIONS
        })
      )
    })
  },
  serialize (options) {
    var serial = AppModel.prototype.serialize.call(this, options)
    if (!this.triggers) {
      serial.triggers = []
    } else {
      serial.triggers = this.triggers
        .filter(eve => {
          if (!eve) return false
          if (typeof eve === 'object') {
            return Boolean(!eve._id)
          }
          return typeof eve === 'string'
        })
        .map(eve => {
          if (typeof eve === 'object') {
            return eve._id
          } else return eve // this is the id string
        })
    }

    delete serial.jobs

    return serial
  },
  hostResource () {
    let col = App.state.resources
    let host = col.models.find(resource => {
      return resource.host_id == this.host_id && resource.type == 'host'
    })
    return host
  },
  hasHost () {
    let host = this.hostResource()
    return Boolean(host)
  },
  hostIsReporting () {
    let host = this.hostResource()
    if (!host?.state) { return true } // I cannot determine, so go ahead
    return (host.state === 'normal')
  },
  fetchJobs (options, callback) {
    callback || (callback = () => {})

    if (this.alreadyFetched === true && options.forceFetch !== true) {
      return callback() // abort
    }
    let query = { task_id: this.id }

    if (options.hasOwnProperty(query)) {
      query = Object.assign({}, query, options.query)
    }

    this.jobs.fetch({
      data: {
        where: query
      },
      success: () => {
        this.alreadyFetched = true
        callback(null, this.jobs)
      },
      error: (arg1) => {
        callback(new Error(arg1))
      }
    })
  },
  buildTaskSummary () {
    let tagsString = ''
    if (Array.isArray(this.tags)) {
      if (this.tags.length === 1) {
        tagsString = `[${this.tags[0]}]`
      }
      if (this.tags.length === 2) {
        tagsString = `[${this.tags[0]}] [${this.tags[1]}]`
      }
      if (this.tags.length >= 3) {
        tagsString = `[${this.tags[0]}] [${this.tags[1]}] [${this.tags[2]}]`
      }
    }

    const version = ` [rev.${this.version}]`

    if (this.hostname) {
      return `${this.type.toUpperCase()} - ${this.name} (${this.hostname}) ${tagsString}${version}`
    } else {
      return `${this.type.toUpperCase()} - ${this.name} ${tagsString}${version}`
    }
  }
})

export default Schema
