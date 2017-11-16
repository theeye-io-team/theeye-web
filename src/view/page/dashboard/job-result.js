'use strict'

import View from 'ampersand-view'
import State from 'ampersand-state'
import Collection from 'ampersand-collection'
import Modalizer from 'components/modalizer'
import moment from 'moment'

const ScriptJobResult = View.extend({
  props: {
    result: 'state'
  },
  template: `
    <table class="table table-striped">
      <thead>
      </thead>
      <tbody>
        <tr><td>output code</td><td><i data-hook="code"></i></td></tr>
        <tr><td>last line</td><td><i data-hook="lastline"></i></td></tr>
        <tr><td>log</td><td><i data-hook="log"></i></td></tr>
        <tr><td>killed</td><td><i class="fa" data-hook="killed"></i></td></tr>
      </tbody>
    </table>
  `,
  bindings: {
    'result.code': { hook:'code' },
    'result.lastline': { hook:'lastline' },
    'result.log': { hook:'log' },
    killed: { hook:'killed' }
    //'result.killed': {
    //  hook:'killed',
    //  type:'booleanClass',
    //  yes:'fa-check',
    //  no:'fa-remove'
    //},
  },
  derived: {
    killed: {
      deps: ['result.killed'],
      fn () {
        return this.result.killed ? 'yes' : 'no'
      }
    }
  }
})

const Header = State.extend({
  props: {
    value: 'string',
    name: 'string'
  }
})

const HeaderView = View.extend({
  template: `
    <div>
      <b data-hook="name"></b>: <i data-hook="value"></i>
    </div>
  `,
  bindings: {
    'model.name': { hook: 'name' },
    'model.value': { hook: 'value' }
  }
})

const ScraperJobResult = View.extend({
  props: {
    result: 'state',
  },
  template: `
    <div style='overflow:scroll;max-height: 500px;'>
      <h2>Remote reponse</h2>
      <table class="table table-striped">
        <thead>
        </thead>
        <tbody>
          <tr><td>Message</td><td><i data-hook="message"></i></td></tr>
          <tr><td>Status Code</td><td><i data-hook="status_code"></i></td></tr>
          <tr><td>Body</td><td><i data-hook="body"></i></td></tr>
          <tr><td>Headers</td><td data-hook="headers"></td></tr>
        </tbody>
      </table>
    </div>
  `,
  bindings: {
    'result.status_code': { hook: 'status_code' },
    'result.message': { hook: 'message' },
    'result.body': { hook: 'body' },
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)

    this.collection = new Collection(this.result.headers, { model: Header })

    this.listenTo(this.result, 'change:headers', () => {
      this.collection.reset( this.result.headers )
    })
  },
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      this.collection,
      HeaderView,
      this.queryByHook('headers')
    )
  }
})

const JobView = View.extend({
  props: {
    job: 'state'
  },
  template: `
    <div>
      <h4>Job execution <b data-hook="lifecycle"></b></h4>
      <h4>Result <b data-hook="state"></b></h4>
      <p><i class="fa fa-user"></i> <span data-hook="user-name"></span></p>
      <p><i class="fa fa-envelope-o"></i> <span data-hook="user-email"></span></p>
      <p><i class="fa fa-calendar"></i> <span data-hook="timestamp"></span></p>
      <div class="text-block text-block-default" data-hook="output-container"> </div>
    </div>
  `,
  bindings: {
    'job.lifecycle': { hook:'lifecycle' },
    'job.state': { hook:'state' },
    'job.user.username': { hook:'user-name' },
    'job.user.email': { hook:'user-email' },
    timestamp: { hook:'timestamp' },
  },
  derived: {
    timestamp: {
      deps: ['job.last_update'],
      fn () {
        return moment(this.job.last_update).format("dddd, MMMM Do YYYY, h:mm:ss a")
      }
    }
  },
  render () {
    this.renderWithTemplate(this)

    if (!this.job||!this.job._type) return // this task was never executed?

    const type = this.job._type
    const opts = { result: this.job.result }

    if (type === 'ScriptJob') {
      this.result = new ScriptJobResult(opts)
    } else if (type === 'ScraperJob') {
      this.result = new ScraperJobResult(opts)
    } else {
      if (!type) {
        throw new Error('job _type unrecognised')
      }
    }

    this.renderSubview(this.result, this.queryByHook('output-container'))
  }
})

/**
 *
 * @summary modal to display jobs output
 *
 */
module.exports = Modalizer.extend({
  props: {
    job: 'state'
  },
  initialize (options) {
    Modalizer.prototype.initialize.apply(this, arguments)

    this.backdrop = true
    this.title = 'Execution Output'
    this.bodyView = new JobView({ job: this.job })

    this.listenTo(this,'hidden',() => {
      this.bodyView.remove()
      delete this.bodyView
    })

    //this.listenTo(this.job,'change:result',() => {
    //  if (!this.job.result) return
    //  this.bodyView.json = this.job.result
    //  this.bodyView.render()
    //})
  }
})
