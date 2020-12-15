
import moment from 'moment'
import ansi2html from 'ansi-to-html'
import View from 'ampersand-view'
import State from 'ampersand-state'
import Collection from 'ampersand-collection'
import Modalizer from 'components/modalizer'
import JsonViewer from 'components/json-viewer'

import './styles.less'

/**
 *
 * @summary modal to display jobs execution summary
 *
 */
export default Modalizer.extend({
  props: {
    job: 'state'
  },
  initialize (options) {
    Modalizer.prototype.initialize.apply(this, arguments)

    this.backdrop = true
    this.title = 'Execution Result'

    const type = this.job._type
    if (!SummaryJobsMap.hasOwnProperty(type)) {
      return console.error('error job type')
    }
    this.bodyView = new SummaryJobsMap[type]({ job: this.job })

    this.listenTo(this, 'hidden', () => {
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
    killed: { hook: 'killed' },
    html_log: {
      type: 'innerHTML',
      hook: 'log'
    }
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

const BaseJobView = View.extend({
  props: {
    job: 'state',
    moreinfo_toggle: ['boolean', false, false]
  },
  template () {
    const html = `
      <div class="job-result-component">
        <div data-hook="summary-container">
          <h4>State <i data-hook="lifecycle_icon" aria-hidden="true" style="color:#304269;"></i></h4>
          <h4>Lifecycle <b data-hook="lifecycle"></b></h4>
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
          <div>
            <i class="fa fa-sign-in"></i> Input
            <div data-hook="input"></div>
          </div>
          <div>
            <i class="fa fa-sign-out"></i> Output
            <div data-hook="output"></div>
          </div>
          <div>
            <i class="fa fa-cubes"></i> Components
            <div data-hook="components"></div>
          </div>
          <div>
            <i class="fa fa-flask"></i> Customize Next
            <div data-hook="next"></div>
          </div>
        </div>
        <div class="moreinfo-container" data-hook="log-container">
          <a class="moreinfo" data-hook="moreinfo-toggle">
            <i class="fa fa-search"></i> More Info
          </a>
          <div class="text-block text-block-default" data-hook="moreinfo-container"></div>
        </div>
      </div>
    `
    return html
  },
  bindings: {
    'job.lifecycle_icon': {
      hook: 'lifecycle_icon',
      type: 'attribute',
      name: 'class'
    },
    'job.lifecycle': { hook:'lifecycle' },
    'job.state': { hook:'state' },
    'job.user.username': { hook:'user-name' },
    'job.user.email': { hook:'user-email' },
    lastupdate: { hook:'lastupdate' },
    creationdate: { hook:'creationdate' },
    moreinfo_toggle: {
      hook: 'moreinfo-container',
      type: 'toggle'
    }
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
    components: {
      deps: ['job.components'],
      fn () {
        return this.job.result.components || ''
      }
    },
    next: {
      deps: ['job.next'],
      fn () {
        return this.job.result.next || ''
      }
    },
    input: {
      deps: ['job.task_arguments_values', 'job.task.task_arguments'],
      fn () {
        let input = Object.assign({}, this.job.task_arguments_values)
        if (
          !input ||
          (Array.isArray(input) && input.length === 0)
        ) {
          return ''
        }

        this.job.task.task_arguments.forEach(arg => {
          if (arg.masked === true) {
            input[arg.order] = '*******'
          }
        })

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

    this.renderResultView()
    this.renderJsonView({ json: this.output, el: this.queryByHook('output') })
    this.renderJsonView({ json: this.input, el: this.queryByHook('input') })
    this.renderJsonView({ json: this.components, el: this.queryByHook('components') })
    this.renderJsonView({ json: this.next, el: this.queryByHook('next') })
  },
  renderResultView () {
    const type = this.job._type
    if (!JobResultClassMap.hasOwnProperty(type)) {
      return console.error('error job type')
    }

    this.result = new JobResultClassMap[type]({ result: this.job.result })
    this.renderSubview(
      this.result,
      this.queryByHook('moreinfo-container')
    )
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

const ScriptJobSummary = BaseJobView.extend({})
const ScraperJobSummary = BaseJobView.extend({})
const NotificationJobSummary = BaseJobView.extend({})
const DummyJobSummary = BaseJobView.extend({})
const ApprovalJobSummary = BaseJobView.extend({
  render () {
    BaseJobView.prototype.render.apply(this, arguments)
    this.renderApprovers()
  },
  renderApprovers () {
    const el = this.queryByHook('summary-container')
    const users = this.job.approversUsers
    const approvers = document.createElement('div')
    approvers.innerHTML = `
      <i class="fa fa-users"></i>
      <b>Approvers</b>
      <div style="padding: 10px; padding-left: 25px;">${escapeHtml(users.toString())}</div>
    `
    el.appendChild(approvers)
  }
})

const SummaryJobsMap = {}
SummaryJobsMap['ScriptJob'] = ScriptJobSummary
SummaryJobsMap['ScraperJob'] = ScraperJobSummary
SummaryJobsMap['DummyJob'] = DummyJobSummary
SummaryJobsMap['NotificationJob'] = NotificationJobSummary
SummaryJobsMap['ApprovalJob'] = ApprovalJobSummary

//function stripHtml (html) {
//  if (DOMParser) {
//    var doc = new DOMParser().parseFromString(html, 'text/html')
//    return doc.body.textContent || ""
//  } else {
//    return escapeHtml(html)
//  }
//}

const escapeHtml = (html) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return html.replace(/[&<>"']/g, function(m) { return map[m]; });
}
