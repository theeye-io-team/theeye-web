import App from 'ampersand-app'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import * as LifecycleConstants from 'constants/lifecycle'
import * as StateConstants from 'constants/states'
import * as JobConstants from 'constants/job'
import * as TaskConstants from 'constants/task'
import { Model as User } from 'models/user'

import config from 'config'

const urlRoot = function (version) {
  if (version === 'v2') {
    return `${config.supervisor_api_url}/job`
  } else {
    return `${config.supervisor_api_url}/${App.state.session.customer.name}/job`
  }
}

const BaseJob = AppModel.extend({
  // dataTypes: {
  //  lifecycle: {
  //    set: function (newVal) {
  //      return {
  //        val: newVal,
  //        type: 'lifecycle'
  //      }
  //    },
  //    compare: function (currentVal, newVal) {
  //      if (currentVal === newVal) {
  //        return true
  //      } else {
  //        const valid = LifecycleConstants.isValidNewLifecycle(currentVal, newVal)
  //        if (!valid) {
  //          logger.warn('invalid lifecycle transition')
  //        }
  //        return valid
  //      }
  //    }
  //  }
  // },
  urlRoot,
  urlV2 () {
    return `${urlRoot('v2')}/${this.id}`
  },
  props: {
    id: 'string',
    user_id: 'string',
    task_id: 'string',
    host_id: 'string',
    script_id: 'string',
    acl: ['array', false, () => []],
    empty_viewers: ['boolean', false, false],
    // script_arguments: 'array',
    task_arguments: 'array',
    customer_id: 'string',
    customer_name: 'string',
    // script: 'object', // embedded
    // task: 'object', // embedded
    // host: 'object',
    name: 'string',
    notify: 'boolean',
    state: 'string',
    lifecycle: 'string',
    // result: ['state',false,null],
    creation_date: 'date',
    last_update: 'date',
    event: 'any',
    event_id: 'string',
    _type: 'string',
    task_arguments_values: 'array',
    output: 'any',
    user_inputs: 'boolean',
    user_inputs_members: 'array',
    workflow_id: 'string',
    workflow_job_id: 'string',
    assigned_users: ['array', false, () => { return [] }]
  },
  children: {
    user: User
  },
  session: {
    owner: 'object',
    assignee: ['array',false, ()=>{ return [] }],
    observers: ['array',false, ()=>{ return [] }],
    skipInputs: ['boolean', false, false]
  },
  requiresInteraction () {
    const session = App.state.session
    if (this.lifecycle !== LifecycleConstants.ONHOLD) { return false }

    if (this.user_inputs !== true) { return false }

    if (Array.isArray(this.user_inputs_members) && this.user_inputs_members.length > 0) {
      const members = this.user_inputs_members
      if (Array.isArray(members) && members.length > 0) {
        return (members.indexOf(session.member_id) !== -1)
      }
    } else {
      return this.isOwner(session.user)
    }
  },
  /**
   *
   * job is owned by the user who started it manually or by triggers it owns.
   *
   * The owner can also be set programatically
   *
   */
  isOwner (user) {
    // this job belongs to a workflow
    if (this.workflow_job_id) {
      // get the workflow
      const workflowJob = App.state.jobs.get(this.workflow_job_id)
      // workflow job is present only if user has visibility of it
      // just in case of error
      if (!workflowJob) { return false }
      return workflowJob.verifyOwnerUser(user)
    } else {
      return this.verifyOwnerUser(user)
    }
  },
  verifyOwnerUser (user) {
    if(this.user.id === undefined) {
      // FIXME: this.user generates with undefined email, name, username, id
      //        and credential. I believe it's because this job was generated
      //        with curl, therefore it has no assigned user. Further testing
      //        is needed. This should be an API side fix
      return(true) // Temporary patch.
    }
      if (this.user && this.user.email && user.email) {
      return (user.email.toLowerCase() === this.user.email.toLowerCase())
    }
    if (this.user_id && (user._id || user.id)) {
      let uid = (user._id || user.id)
      return this.user_id === uid
    }
    return false
  },
  derived: {
    inProgress: {
      deps: ['lifecycle'],
      fn () {
        return LifecycleConstants.inProgress(this.lifecycle)
      }
    },
    isCompleted: {
      deps: ['lifecycle'],
      fn () {
        return LifecycleConstants.isCompleted(this.lifecycle)
      }
    },
    taskModel: {
      deps: ['task'],
      fn () {
        return this.task
        // if (!this.task) {
        //  return {}
        // }
        // return new App.Models.Task.Factory(this.task, {})
      }
    },
    workflow_job: {
      deps: ['workflow_job_id'],
      cache: false,
      fn () {
        return App.state.jobs.get(this.workflow_job_id)
      }
    },
    progress_icon: {
      deps: ['lifecycle'],
      fn () {
        const lifecycle = this.lifecycle

        if (lifecycle === LifecycleConstants.READY) {
          return 'fa fa-spin fa-refresh'
        }

        if (lifecycle === LifecycleConstants.ASSIGNED) {
          return 'fa fa-spin fa-refresh remark-success'
        }

        return ''
      }
    },
    lifecycle_icon: {
      deps: ['lifecycle', 'state'],
      fn () {
        const lifecycle = this.lifecycle
        const state = this.state

        if (LifecycleConstants.isCompleted(lifecycle)) {
          if (state === StateConstants.TIMEOUT) {
            return 'fa fa-clock-o remark-alert'
          }

          if (
            state === StateConstants.FAILURE ||
            state === StateConstants.CANCELED
          ) {
            return 'fa fa-exclamation remark-alert'
          }

          if (state === StateConstants.ERROR) {
            return 'fa fa-question remark-warning'
          }

          return 'fa fa-check remark-success'
        }

        if (lifecycle === LifecycleConstants.ONHOLD) {
          return 'fa fa-clock-o remark-warning'
        }

        if (
          lifecycle === LifecycleConstants.READY ||
          lifecycle === LifecycleConstants.ASSIGNED
        ) {
          return 'fa fa-stop remark-alert'
        }

        return 'fa fa-play'
      }
    }
  }
})

const ScriptJobResult = State.extend({
  props: {
    code: 'any',
    signal: 'any',
    killed: ['boolean', false, false],
    lastline: ['string', false],
    stdout: ['string', false],
    stderr: ['string', false],
    log: ['string', false],
    times: ['object', false, () => { return {} }],
    components: ['object', false, () => { return {} }],
    next: ['object', false, () => { return {} }]
  }
})

const ScraperJobResult = State.extend({
  props: {
    message: 'string',
    response: ['object', false, () => { return {} }]
  },
  derived: {
    headers: {
      deps: ['response'],
      fn () {
        const headers = this.response.headers
        if (!headers || Object.prototype.toString.call(headers) !== '[object Object]') { return [] }

        return Object.keys(headers).map(key => {
          const value = headers[key]
          const fvalue = typeof value === 'string' ? value : JSON.stringify(value)
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
    url: ['string', false, ''],
    status_code: ['number', false, 0],
    error_code: ['number', false, 0],
    message: ['string', false, ''],
    details: ['object', false, () => { return {} }]
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
  props: {
    approvers: ['array', false, () => { return [] }],
    success_enabled: ['boolean', true, true],
    failure_enabled: ['boolean', true, true],
    cancel_enabled: ['boolean', true, true],
    ignore_enabled: ['boolean', true, true],
    success_label: ['string', true, 'Reject'],
    failure_label: ['string', true, 'Approve'],
    cancel_label: ['string', true, 'Cancel'],
    ignore_label: ['string', true, 'Ignore']
  },
  children: {
    result: ApprovalJobResult,
    task: TaskTypeInitializer(TaskConstants.TYPE_APPROVAL)
  },
  derived: {
    approversUsers: {
      cache: false,
      deps: ['approvers'],
      fn () {
        return this.approvers.map(userId => {
          const member = App.state.members.find(mem => mem.user.id === userId)
          if (member && member.user) {
            return `${member.user.name} <${member.user.email}>`
          } else {
            return 'Information cannot be displayed'
          }
        })
      }
    }
  },
  isApprover (user) {
    const userid = user.id
    if (
      !this.approvers ||
      (Array.isArray(this.approvers) && this.approvers.length === 0)
    ) {
      return false
    }
    return (this.approvers.indexOf(userid) !== -1)
  },
  requiresInteraction () {
    const session = App.state.session
    if (this.lifecycle !== LifecycleConstants.ONHOLD) { return false }

    return this.isApprover(session.user)
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
    // authtoken: 'string', // private
    operation: 'string'
  },
  children: {
    result: NgrokIntegrationResult
  }
})

const JobFactory = function (attrs, options = {}) {
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
    const type = attrs._type
    let model
    switch (type) {
      case JobConstants.SCRIPT_TYPE:
        model = new ScriptJob(attrs, options)
        break
      case JobConstants.SCRAPER_TYPE:
        model = new ScraperJob(attrs, options)
        break
      case JobConstants.APPROVAL_TYPE:
        model = new ApprovalJob(attrs, options)
        break
      case JobConstants.DUMMY_TYPE:
        model = new DummyJob(attrs, options)
        break
      case JobConstants.NOTIFICATION_TYPE:
        model = new NotificationJob(attrs, options)
        break
      case JobConstants.WORKFLOW_TYPE:
        model = new WorkflowJob(attrs, options)
        break
      default:
        throw new Error(`unrecognized type ${type}`)
    }
    return model
  }

  model = createModel()
  if (options.collection !== App.state.jobs) {
    App.state.jobs.add(model, { merge: true })
  }
  return model
}

export const Collection = AppCollection.extend({
  comparator: 'creation_date',
  url: urlRoot,
  model: (attrs, options) => {
    const model = new JobFactory(attrs, options)
    if (options.collection.child_of) {
      const task = options.collection.child_of
      model.task.set(task.serialize())
    }
    return model
  },
  isModel (model) {
    const isModel = (
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
    jobsLength: 'number',
    lifecycle: 'string'
  },
  initialize () {
    BaseJob.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(this.jobs, 'add change sync reset remove', function () {
      if (this.jobs.length) {
        this.jobsLength = this.jobs.length
        const currentJob = this.jobs.at(this.jobs.length - 1) // last
        this.lifecycle = currentJob.lifecycle
        this.state = currentJob.state
      } else {
        this.lifecycle = undefined
        this.state = undefined
      }
    })
  },
  isOwner (user) {
    return this.verifyOwnerUser(user)
  },
  requiresInteraction() {
    return this.current_job.requiresInteraction() 
  },
  derived: {
    first_job: {
      deps: ['jobsLength'],
      fn () {
        if (this.jobs.length === 0) { return null }
        return this.jobs.at(0)
      }
    },
    previous_job: {
      deps: ['jobsLength'],
      fn () {
        if (this.jobs.length === 0) { return null }
        if ((this.jobs.length - 2) < 0) { return null }

        return this.jobs.models[this.jobs.length - 2]
      }
    },
    current_job: { // the last
      deps: ['jobsLength'],
      fn () {
        if (this.jobs.length === 0) { return null }
        if ((this.jobs.length - 1) < 0) { return null }

        return this.jobs.at(this.jobs.length - 1)
      }
    }
  }
  // getPreviousJob () {
  //  return this.jobs.models[ this.jobs.length - 2 ]
  // }
})

export const Approval = ApprovalJob
export const Script = ScriptJob
export const Scraper = ScraperJob
export const Dummy = DummyJob
export const Notification = NotificationJob
export const Workflow = WorkflowJob
export const NgrokIntegration = NgrokIntegrationJob
export const Factory = JobFactory
