'use strict'

import View from 'ampersand-view'
import State from 'ampersand-state'
import Collection from 'ampersand-collection'
import Modalizer from 'components/modalizer'
import moment from 'moment'
import ansi2html from 'ansi-to-html'
import JsonViewer from 'components/json-viewer'

import './styles.less'

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
    this.title = 'Execution Result'
    this.bodyView = new JobView({ job: this.job })

    this.listenTo(this,'hidden',() => {
      this.bodyView.remove()
      delete this.bodyView
    })
  }
})

const ApprovalJobResult = View.extend({
  props: {
    result: 'state'
  },
  template: `<div class="result approval-result"></div>`
})

const DummyJobResult = View.extend({
  props: {
    result: 'state'
  },
  template: `<div class="result dummy-result"></div>`
})

const NotificationJobResult = View.extend({
  props: {
    result: 'state'
  },
  template: `<div class="result approval-result"></div>`
})

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
          <tr>
            <td>Output Code</td>
            <td><span data-hook="code"></span></td>
          </tr>
          <tr>
            <td>Killed</td>
            <td>
              <span class="fa" data-hook="killed"></span>
            </td>
          </tr>
          <tr>
            <td>Last Line</td>
            <td>
              <div class="output">
                <pre data-hook="lastline"></pre>
              </div>
            </td>
          </tr>
          <tr>
            <td>Log</td>
            <td>
              <div class="output">
                <pre data-hook="log"></pre>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  bindings: {
    'result.code': { hook:'code' },
    'result.lastline': { hook: 'lastline' },
    html_log: {
      type:'innerHTML',
      hook:'log'
    },
    killed: { hook:'killed' }
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
        if (!this.result||!this.result.log) { return '' }
        let text = this.result.log
        //let node = document.createTextNode(this.result.log)
        let converter = new ansi2html()
        return converter.toHtml(escapeHtml(text))
      }
    },
    html_lastline: {
      deps: ['result.lastline'],
      fn () {
        if (!this.result||!this.result.lastline) return ''
        let converter = new ansi2html()
        return converter.toHtml(this.result.lastline)
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
    body: { hook: 'body' },
  },
  derived: {
    body: {
      deps: ['result.body'],
      fn () {
        let body = this.result.body
        if (body === undefined) {
          return 'response body not available'
        }
        return JSON.stringify(body)
      }
    }
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
    job: 'state',
    moreinfo_toggle: ['boolean', false, false]
  },
  template: `
    <div class="job-result-component">
      <h4>Job execution <b data-hook="lifecycle"></b></h4>
      <h4>Result <b data-hook="state"></b></h4>
      <p><i class="fa fa-user"></i> <span data-hook="user-name"></span></p>
      <p><i class="fa fa-envelope-o"></i> <span data-hook="user-email"></span></p>
      <p>
        <i class="fa fa-hourglass-start"></i>
        <span data-hook="creationdate"></span>
      </p>
      <p>
        <i class="fa fa-hourglass-end"></i>
        <span data-hook="lastupdate"></span>
      </p>
      <p>
        <i class="fa fa-sign-in"></i> Input
        <div data-hook="input"></div>
      </p>
      <p>
        <i class="fa fa-sign-out"></i> Output
        <div data-hook="output"></div>
      </p>

      <a class="moreinfo" data-hook="moreinfo-toggle" href="#">More Info</a>
      <div class="text-block text-block-default" data-hook="moreinfo-container"></div>
    </div>
  `,
  bindings: {
    'job.lifecycle': { hook:'lifecycle' },
    'job.state': { hook:'state' },
    'job.user.username': { hook:'user-name' },
    'job.user.email': { hook:'user-email' },
    lastupdate: { hook:'lastupdate' },
    creationdate: { hook:'creationdate' },
    moreinfo_toggle: {
      hook: 'moreinfo-container',
      type: 'toggle'
    },
    //input: { hook: 'input' },
    //output: { hook: 'output' },
  },
  derived: {
    output: {
      deps: ['job.output'],
      fn () {
        let output = this.job.output
        if (!output) { return '' }
        if (Array.isArray(output)) {
          let parsed = []
          output.forEach(item => {
            try {
              parsed.push( JSON.parse(item) )
            } catch (e) {
              parsed.push(item)
            }
          })
          return parsed
        } else {
          return output
        }
      }
    },
    input: {
      deps: ['job.task_arguments_values'],
      fn () {
        let input = this.job.task_arguments_values
        if (
          !input ||
          (Array.isArray(input) && input.length === 0)
        ) {
          return ''
        }

        return input
      }
    },
    lastupdate: {
      deps: ['job.last_update'],
      fn () {
        return moment(this.job.last_update).format("dddd, MMMM Do YYYY, h:mm:ss a")
      }
    },
    creationdate: {
      deps: ['job.creation_date'],
      fn () {
        return moment(this.job.creation_date).format("dddd, MMMM Do YYYY, h:mm:ss a")
      }
    }
  },
  events: {
    'click a[data-hook=moreinfo-toggle]':'onClickToggleMoreInfo'
  },
  onClickToggleMoreInfo (event) {
    this.toggle('moreinfo_toggle')
    //this.query('moreinfo-container').
  },
  render () {
    this.renderWithTemplate(this)

    if (!this.job||!this.job._type) {
      return // this task was never executed?
    }

    this.renderJsonView({
      json: this.output,
      el: this.queryByHook('output')
    })
    this.renderJsonView({
      json: this.input,
      el: this.queryByHook('input')
    })

    const type = this.job._type
    if (!JobResultClassMap.hasOwnProperty(type)) {
      return console.error('error job type')
    } else {
      this.result = new JobResultClassMap[type]({
        result: this.job.result
      })

      this.renderSubview(
        this.result,
        this.queryByHook('moreinfo-container')
      )
    }
  },
  renderJsonView (opts) {
    let { json, el } = opts
    let view = new JsonViewer({ json })
    this.renderSubview(view, el)
  }
})

const JobResultClassMap = {}
JobResultClassMap['ScriptJob'] = ScriptJobResult
JobResultClassMap['ScraperJob'] = ScraperJobResult
JobResultClassMap['ApprovalJob'] = ApprovalJobResult
JobResultClassMap['DummyJob'] = DummyJobResult
JobResultClassMap['NotificationJob'] = NotificationJobResult

function stripHtml (html) {
  if (DOMParser) {
    var doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ""
  } else {
    return escapeHtml(html)
  }
}

function escapeHtml (html) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return html.replace(/[&<>"']/g, function(m) { return map[m]; });
}
