import App from 'ampersand-app'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import LifecycleConstants from 'constants/lifecycle'
import JobConstants from 'constants/job'
import { Model as User } from 'models/user'
import FIELD from 'constants/field'

const config = require('config')

const urlRoot = `${config.api_url}/job`

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
  urlRoot: urlRoot,
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
    task: 'object',
    task_arguments_values: 'array',
    output: 'array',
    workflow_id: 'string',
    workflow_job_id: 'string'
  },
  children: {
    user: User,
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
        if (!this.task) { return {} }
        return new App.Models.Task.Factory(this.task, {})
      }
    },
    hasDinamicOutputs: {
      deps: ['task'],
      fn () {
        if (!this.task) return false
        let hasDinamicOutputs = Boolean(
          this.task.output_parameters.find(arg => {
            return arg.type && (
              arg.type === FIELD.TYPE_INPUT ||
              arg.type === FIELD.TYPE_SELECT ||
              arg.type === FIELD.TYPE_DATE ||
              arg.type === FIELD.TYPE_FILE ||
              arg.type === FIELD.TYPE_REMOTE_OPTIONS
            )
          })
        )
        return hasDinamicOutputs
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
    times: ['object',false,()=>{ return {} }]
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

const ScriptJob = BaseJob.extend({
  children: {
    result: ScriptJobResult
  }
})

const ScraperJob = BaseJob.extend({
  children: {
    result: ScraperJobResult
  }
})

const ApprovalJob = BaseJob.extend({
  children: {
    result: ApprovalJobResult
  },
  isApprover (userid) {
    if (!this.task.approvers) { return false }
    return this.task.approvers.indexOf(userid) !== -1
  },
  session: {
    skip: ['boolean', false, false]
  }
})

const DummyJob = BaseJob.extend({
  children: {
    result: DummyJobResult
  }
})

const NotificationJob = BaseJob.extend({
  children: {
    result: NotificationJobResult
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
      // reset
      //model.clear()
      //model.result.clear()

      // and update
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

  model = createModel()
  if (options.collection !== App.state.jobs) {
    App.state.jobs.add(model, {merge:true})
  }
  return model
}

const Collection = AppCollection.extend({
  comparator: 'creation_date',
  url: urlRoot,
  model: JobFactory,
  isModel (model) {
    let isModel = (
      model instanceof ScraperJob ||
      model instanceof ScriptJob ||
      model instanceof ApprovalJob ||
      model instanceof DummyJob ||
      model instanceof NotificationJob
    )
    return isModel
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
  }
})

exports.Approval = ApprovalJob
exports.Script = ScriptJob
exports.Scraper = ScraperJob
exports.Dummy = DummyJob
exports.Notification = NotificationJob
exports.Workflow = WorkflowJob
exports.NgrokIntegration = NgrokIntegrationJob

exports.Factory = JobFactory
exports.Collection = Collection
