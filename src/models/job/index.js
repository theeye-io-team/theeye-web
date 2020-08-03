import App from 'ampersand-app'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import * as LifecycleConstants from 'constants/lifecycle'
import * as JobConstants from 'constants/job'
import * as TaskConstants from 'constants/task'
import { Model as User } from 'models/user'
import * as FIELD from 'constants/field'

import config from 'config'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/job`
}

const BaseJob = AppModel.extend({
  dataTypes: {
    lifecycle: {
      set: function (newVal) {
        return {
          val: newVal,
          type: 'lifecycle'
        }
      },
      compare: function (currentVal, newVal) {
        if (currentVal === newVal) {
          return true
        } else {
          return !LifecycleConstants.isValidNewLifecycle(currentVal, newVal)
        }
      }
    }
  },
  urlRoot,
  props: {
    id: 'string',
    user_id: 'string',
    task_id: 'string',
    host_id: 'string',
    script_id: 'string',
    //script_arguments: 'array',
    task_arguments: 'array',
    customer_id: 'string',
    customer_name: 'string',
    //script: 'object', // embedded
    //task: 'object', // embedded
    //host: 'object',
    name: 'string',
    notify: 'boolean',
    state: 'string',
    lifecycle: 'lifecycle',
    //result: ['state',false,null],
    creation_date: 'date',
    last_update: 'date',
    event: 'any',
    event_id: 'string',
    _type: 'string',
    task_arguments_values: 'array',
    output: 'any',
    workflow_id: 'string',
    workflow_job_id: 'string'
  },
  children: {
    user: User
  },
  requireUserInteraction (user) {
    let task = this.task
    let interact = false
    if (task.user_inputs === true) {
      let members = task.user_inputs_members
      if (Array.isArray(members) && members.length > 0) {
        interact = (members.indexOf(user.id) !== -1)
      }
    }
    return interact || this.isOwner(user)
  },
  isOwner (user) {
    if (!user.email) { return false }
    // this job belongs to a workflow
    if (this.workflow_job_id) {
      // get the workflow
      const workflowJob = App.state.jobs.get(this.workflow_job_id)
      // workflow job is present only if user has visibility of it
      // just in case of error
      if (!workflowJob) { return false }
      if (workflowJob.isOwner(user)) { return true }
    } else {
      if (!this.user || !this.user.email) { return false }
      return (user.email.toLowerCase() === this.user.email.toLowerCase())
    }
  },
  derived: {
    inProgress: {
      deps: ['lifecycle'],
      fn () {
        return LifecycleConstants.inProgress(this.lifecycle)
      }
    },
    taskModel: {
      deps: ['task'],
      fn () {
        return this.task
        //if (!this.task) {
        //  return {}
        //}
        //return new App.Models.Task.Factory(this.task, {})
      }
    }
  }
})

const ScriptJobResult = State.extend({
  props: {
    code: 'any',
    signal: 'any',
    killed: ['boolean',false,false],
    lastline: ['string',false],
    stdout: ['string',false],
    stderr: ['string',false],
    log: ['string',false],
    times: ['object',false,()=>{ return {} }],
    components: ['object',false,()=>{ return {} }]
  }
})

const ScraperJobResult = State.extend({
  props: {
    message: 'string',
    response: ['object',false,() => { return {} }]
  },
  derived: {
    headers: {
      deps: ['response'],
      fn () {
        const headers = this.response.headers
        if (!headers || Object.prototype.toString.call(headers) !== '[object Object]')
          return []

        return Object.keys(headers).map(key => {
          let value = headers[key]
          let fvalue = typeof value === 'string' ? value : JSON.stringify(value)
          return { name: key, value: fvalue }
        })
      }
    },
    chuncked: {
      deps: ['response'],
      fn () {
        return this.response.chuncked || false
      }
    },
    body: {
      deps: ['response'],
      fn () {
        return this.response.body
      }
    },
    status_code: {
      deps: ['response'],
      fn () {
        return this.response.status_code
      }
    }
  }
})

const ApprovalJobResult = State.extend({ })

const DummyJobResult = State.extend({ })

const NotificationJobResult = State.extend({ })

const NgrokIntegrationResult = State.extend({
  props: {
    url:  ['string',false,''],
    status_code: ['number', false, 0],
    error_code: ['number', false, 0],
    message: ['string', false, ''],
    details: ['object',false, () => { return {} }]
  }
})

/**
 *
 * returns a function with a defined Type
 *
 */
const TaskTypeInitializer = (type) => {
  return (attrs, opts) => {
    if (!attrs || !attrs._type) {
      attrs._type = type
      attrs.type = type
    }

    return App.Models.Task.Factory(attrs, opts)
  }
}

const ScriptJob = BaseJob.extend({
  children: {
    result: ScriptJobResult,
    task: TaskTypeInitializer(TaskConstants.TYPE_SCRIPT)
  }
})

const ScraperJob = BaseJob.extend({
  children: {
    result: ScraperJobResult,
    task: TaskTypeInitializer(TaskConstants.TYPE_SCRAPER)
  }
})

const ApprovalJob = BaseJob.extend({
  children: {
    result: ApprovalJobResult,
    task: TaskTypeInitializer(TaskConstants.TYPE_APPROVAL)
  },
  isApprover (user) {
    return this.task.isApprover(user)
  },
  session: {
    skip: ['boolean', false, false]
  }
})

const DummyJob = BaseJob.extend({
  children: {
    result: DummyJobResult,
    task: TaskTypeInitializer(TaskConstants.TYPE_DUMMY)
  }
})

const NotificationJob = BaseJob.extend({
  children: {
    result: NotificationJobResult,
    task: TaskTypeInitializer(TaskConstants.TYPE_NOTIFICATION)
  }
})

const NgrokIntegrationJob = BaseJob.extend({
  props: {
    address: 'string',
    protocol: 'string',
    //authtoken: 'string', // private
    operation: 'string'
  },
  children: {
    result: NgrokIntegrationResult
  }
})

const JobFactory = function (attrs, options={}) {
  if (attrs.isCollection) { return attrs }
  if (attrs.isState) { return attrs } // already constructed

  let model

  if (attrs.id) {
    model = App.state.jobs.get(attrs.id)
    if (model) {
      model.set(attrs)
      if (model.result) {
        model.result.set(attrs.result)
      }
      if (attrs.user) {
        model.user.set(attrs.user)
      }
      return model
    }
  }

  const createModel = () => {
    let type = attrs._type
    let model
    switch (type) {
      case JobConstants.SCRIPT_TYPE:
        model = new ScriptJob(attrs, options)
        break;
      case JobConstants.SCRAPER_TYPE:
        model = new ScraperJob(attrs, options)
        break;
      case JobConstants.APPROVAL_TYPE:
        model = new ApprovalJob(attrs, options)
        break;
      case JobConstants.DUMMY_TYPE:
        model = new DummyJob(attrs, options)
        break;
      case JobConstants.NOTIFICATION_TYPE:
        model = new NotificationJob(attrs, options)
        break;
      case JobConstants.WORKFLOW_TYPE:
        model = new WorkflowJob(attrs, options)
        break;
      default:
        let err = new Error(`unrecognized type ${type}`)
        throw err
        break;
    }
    return model
  }

  // this model is being added to a task.collection
  //if (
  //  options.collection &&
  //  options.collection.parent &&
  //  !options.collection.parent.isCollection &&
  //  /Task/.test(options.collection.parent._type) === true
  //) {
  //  attrs.task = options.collection.parent
  //}

  model = createModel()
  if (options.collection !== App.state.jobs) {
    App.state.jobs.add(model, {merge:true})
  }
  return model
}

export const Collection = AppCollection.extend({
  comparator: 'creation_date',
  url: urlRoot,
  model: (attrs, options) => {
    let model = new JobFactory(attrs, options)
    if (options.collection.child_of) {
      let task = options.collection.child_of
      model.task.set(task.serialize())
    }
    return model
  },
  isModel (model) {
    let isModel = (
      model instanceof ScraperJob ||
      model instanceof ScriptJob ||
      model instanceof ApprovalJob ||
      model instanceof DummyJob ||
      model instanceof NotificationJob
    )
    return isModel
  },
  initialize (models, options) {
    if (options && options.child_of) {
      this.child_of = options.child_of
    }
    AppCollection.prototype.initialize.apply(this, arguments)
  }
})

const WorkflowJob = BaseJob.extend({
  collections: {
    jobs: Collection
  },
  session: {
    lifecycle: 'string'
  },
  initialize () {
    BaseJob.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(
      this.jobs,
      'add change sync reset remove',
      function () {
        if (this.jobs.length) {
          let currentJob = this.jobs.at(this.jobs.length - 1)
          this.lifecycle = currentJob.lifecycle
          this.state = currentJob.state
        } else {
          this.lifecycle = undefined
          this.state = undefined
        }
      }
    )
  },
  /**
   * workflow is owned by the user who execute it first
   */
  isOwner (user) {
    if (!user.email) {
      return false
    }
    if (!this.user || !this.user.email) {
      return false
    }
    return (user.email.toLowerCase() === this.user.email.toLowerCase())
  },
  getPreviousJob () {
    let previousJob = this.jobs.models[this.jobs.length-2]
    if (previousJob) {
      return previousJob
    }
  }
})

export const Approval = ApprovalJob
export const Script = ScriptJob
export const Scraper = ScraperJob
export const Dummy = DummyJob
export const Notification = NotificationJob
export const Workflow = WorkflowJob
export const NgrokIntegration = NgrokIntegrationJob
export const Factory = JobFactory
