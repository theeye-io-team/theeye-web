import State from 'ampersand-state'
import LIFECYCLE from 'constants/lifecycle'
import { Model as User } from 'models/user'

const BaseJob = State.extend({
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
    _type: 'string'
  },
  children: {
    user: User
  },
  derived: {
    inProgress: {
      deps: ['lifecycle'],
      fn () {
        return LIFECYCLE.inProgress(this.lifecycle)
      }
    }
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

const ScraperJob = BaseJob.extend({
  children: {
    result: ScraperJobResult
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

const ScriptJob = BaseJob.extend({
  children: {
    result: ScriptJobResult
  }
})

exports.ScriptJob = ScriptJob
exports.ScraperJob = ScraperJob
