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
    lifecycle: 'string',
    //result: ['state',false,null],
    creation_date: 'date',
    last_update: 'date',
    event: 'any',
    event_id: 'string',
    _type: 'string',
    task: 'object',
    task_arguments_values: 'array',
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
        if (!this.task) return {}
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
  }
})

const DummyJob = BaseJob.extend({
  children: {
    result: DummyJobResult
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

const Factory = function (attrs, options={}) {
  if (attrs.isCollection) { return }

  if (attrs._type == JobConstants.SCRIPT_TYPE) {
    return new ScriptJob(attrs, options)
  }

  if (attrs._type == JobConstants.SCRAPER_TYPE) {
    return new ScraperJob(attrs, options)
  }

  if (attrs._type == JobConstants.APPROVAL_TYPE) {
    return new ApprovalJob(attrs, options)
  }

  if (attrs._type == JobConstants.DUMMY_TYPE) {
    return new DummyJob(attrs, options)
  }

  if (attrs._type == JobConstants.WORKFLOW_TYPE) {
    return new WorkflowJob(attrs, options)
  }

  let err = new Error(`unrecognized type ${attrs._type}`)
  throw err
}

const Collection = AppCollection.extend({
  comparator: 'creation_date',
  url: urlRoot,
  model: Factory,
  isModel (model) {
    let isModel = (
      model instanceof ScraperJob ||
      model instanceof ScriptJob ||
      model instanceof ApprovalJob ||
      model instanceof DummyJob
    )
    return isModel
  }
})

const WorkflowJob = BaseJob.extend({
  collections: {
    jobs: Collection
  }
})

exports.Approval = ApprovalJob
exports.Script = ScriptJob
exports.Scraper = ScraperJob
exports.Dummy = DummyJob
exports.Workflow = WorkflowJob
exports.NgrokIntegration = NgrokIntegrationJob

exports.Factory = Factory
exports.Collection = Collection
