'use strict'

import View from 'ampersand-view'
import State from 'ampersand-state'
import Collection from 'ampersand-collection'
import Modalizer from 'components/modalizer'
import moment from 'moment'
import ansi2html from 'ansi-to-html'

import './styles.less'

const ScriptJobResult = View.extend({
  props: {
    result: 'state'
  },
  template: `
    <div class="result script-result">
      <h2>Script execution log</h2>
      <table class="table">
        <thead> </thead>
        <tbody>
          <tr><td>Output Code</td><td><span data-hook="code"></span></td></tr>
          <tr><td>Killed</td><td><span class="fa" data-hook="killed"></span></td></tr>
          <tr><td>Last Line</td><td><div class="output"><pre data-hook="lastline"></pre></div></td></tr>
          <tr><td>Log</td><td><div class="output"><pre data-hook="log"></pre></td></div></tr>
        </tbody>
      </table>
    </div>
  `,
  bindings: {
    'result.code': { hook:'code' },
    'result.lastline': { hook:'lastline' },
    html_log: {
      type:'innerHTML',
      hook:'log'
    },
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
    },
    html_log: {
      deps: ['result.log'],
      fn () {
        if (!this.result||!this.result.log) return ''
        let converter = new ansi2html()
        return converter.toHtml(this.result.log)
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
    <div class="result scraper-result">
      <h2>Remote reponse</h2>
      <table class="table">
        <thead> </thead>
        <tbody>
          <tr><td>Message</td><td><i data-hook="message"></i></td></tr>
          <tr><td>Status Code</td><td><i data-hook="status_code"></i></td></tr>
          <tr><td>Headers</td><td data-hook="headers"></td></tr>
          <tr><td>Body</td><td><div class="output"><pre data-hook="body"></pre></div></td></tr>
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
    <div class="job-result-component">
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
