
import App from 'ampersand-app'
import ClipboardButton from 'components/clipboard-button'
import moment from 'moment'
import ansi2html from 'ansi-to-html'
import View from 'ampersand-view'
import State from 'ampersand-state'
import Collection from 'ampersand-collection'
import Modalizer from 'components/modalizer'
import JsonViewer from 'components/json-viewer'
import DownloadButton from 'view/buttons/download'
import isJSON from 'validator/lib/isJSON'

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
    this.title = `${this.job.name} # ${this.job.id}`

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
      <table>
        <thead> </thead>
        <tbody>
          <tr>
            <th>Output Code</th>
            <td><span data-hook="code"></span></td>
          </tr>
          <tr>
            <th>Killed</th>
            <td>
              <span class="fa" data-hook="killed"></span>
            </td>
          </tr>
          <tr>
            <th>Last Line</th>
            <td>
              <div class="output">
                <span data-hook="lastline"></span>
              </div>
            </td>
          </tr>
          <tr>
            <th>Log</th>
            <td>
              <div>
                <a data-hook="formatter" href="#" class="fa fa-align-left"></a>
              </div>
              <div data-hook="formatter-log" class="output">
                <pre data-hook="log"></pre>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  events: {
    'click [data-hook=formatter]': function (event) {
      event.preventDefault()
      event.stopPropagation()

      const container = this.queryByHook('formatter-log')

      let innerElement = container.querySelector('pre')
      let newChild
      if (innerElement !== null) {
        newChild = document.createElement('span')
      } else {
        innerElement = container.querySelector('span')
        newChild = document.createElement('pre')
      }

      newChild.dataset.hook = 'log'
      newChild.innerHTML = this.html_log
      container.replaceChild(newChild, innerElement)
    }
  },
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
    result: 'state'
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
          <tr><td>Body</td><td><div class="output"><span data-hook="body"></span></div></td></tr>
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
    View.prototype.initialize.apply(this, arguments)

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
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    App.actions.job.fillUser(this.job)
    App.actions.job.getParticipants(this.job.id)
    App.actions.job.fetch(this.job.id) // fetch inputs, task data, outputs, exec. result

    this.listenToAndRun(this.job, 'change:assignee change:observers change:owner', () => {
      this.updateState()
    })
  },
  updateState () {
    const job = this.job
    if (job.assignee.length > 0) {
      this.assignee = job.assignee.map(user => `${user.username} <${user.email}>`).join(',')
    } else {
      this.assignee = 'Not assigned'
    }

    if (job.observers.length > 0) {
      this.observers = job.observers.map(user => `${user.username} <${user.email}>`).join(',')
    } else {
      this.observers = 'Not assigned'
    }

    if (job.owner) {
      this.owner = `${job.owner.username} <${job.owner.email}>`
    } else {
      this.owner = 'Not assigned'
    }
  },
  props: {
    job: 'state',
    moreinfo_toggle: ['boolean', false, false],
    owner: 'string',
    assignee: 'string',
    observers: 'string'
  },
  template () {
    const html = `
      <div class="job-result-component">
        <div data-hook="summary-container">
          <h4>State <i data-hook="lifecycle_icon" aria-hidden="true" style="color:#304269;"></i></h4>
          <h4>Lifecycle <b data-hook="lifecycle"></b></h4>
          <p><i style="font-weight:bold">Owner</i> <span data-hook="owner"></span></p>
          <p><i style="font-weight:bold">Assignee</i> <span data-hook="assignee"></span></p>
          <p><i style="font-weight:bold">Observers (ACL)</i> <span data-hook="observers"></span></p>
          <p>
            <i class="fa fa-hourglass-start"></i>
            <span data-hook="creationdate"></span>
          </p>
          <p>
            <i class="fa fa-hourglass-end"></i>
            <span data-hook="lastupdate"></span>
          </p>
          <a href="#" data-hook="fetch">Update <i class="fa fa-refresh"></i></a>
          <div>
            <i class="fa fa-sign-in"></i> Input
            <div data-hook="input"></div>
          </div>
          <div>
            <i class="fa fa-sign-out"></i> Output
            <div data-hook="output"></div>
          </div>
          <div>
            <i class="fa fa-cubes"></i> UI Components
            <div data-hook="components"></div>
          </div>
          <div>
            <i class="fa fa-flask"></i> Next Task Settings
            <div data-hook="next"></div>
          </div>
        </div>
        <div class="moreinfo-container" data-hook="log-container">
          <button class="moreinfo btn btn-primary" data-hook="moreinfo-toggle">
            <i class="fa fa-search"></i> More Info
          </button>
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
    lastupdate: { hook:'lastupdate' },
    creationdate: { hook:'creationdate' },
    moreinfo_toggle: {
      hook: 'moreinfo-container',
      type: 'toggle'
    },
    owner: { hook:'owner' },
    assignee: { hook: 'assignee' },
    observers: { hook: 'observers' }
  },
  derived: {
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
    'click [data-hook=moreinfo-toggle]':'onClickToggleMoreInfo',
    'click a[data-hook=fetch]':'onClickFetch'
  },
  onClickFetch (event) {
    event.preventDefault()
    event.stopPropagation()

    App.actions.job.fetch(this.job.id)
  },
  onClickToggleMoreInfo (event) {
    this.toggle('moreinfo_toggle')
  },
  render () {
    this.renderWithTemplate(this)

    if (!this.job||!this.job._type) {
      return // this task was never executed?
    }

    this.renderResultView()
    const inputView = new TableView({ rows: this.job.parsedInput })
    this.renderSubview(inputView, this.queryByHook('input'))
    this.listenTo(this.job,'change:parsedInput',() => {
      inputView.rows = this.job.parsedInput
    })

    const outputView = new TableView({ rows: this.job.parsedOutput })
    this.renderSubview(outputView, this.queryByHook('output'))
    this.listenTo(this.job,'change:parsedOutput',() => {
      outputView.rows = this.job.parsedOutput
    })

    //this.renderSubview(new JsonViewer({ json: this.output }), this.queryByHook('output'))

    this.renderSubview(new JsonViewer({ json: this.job.components }), this.queryByHook('components'))
    this.renderSubview(new JsonViewer({ json: this.job.next }), this.queryByHook('next'))
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
  }
})

const RowState = State.extend({
  props: {
    key: 'string',
    value: 'any',
    id: 'number',
    type: 'string'
  }
})

const TableView = View.extend({
  props: {
    rows: ['array', false, () => { return [] }]
  },
  template: `
    <div class="table-component">
      <table></table>
    </div>
  `,
  initialize () {
    View.prototype.initialize.apply(this, arguments)
    this.collection = new Collection()
    this.on('change:rows', this.updateState)
    this.updateState()
  },
  updateState () {
    this.collection.reset([])

    // we need a string to display
    const displayValue = (value) => {
      if (typeof value === 'number' || typeof value === 'string') {
        return value.toString()
      }

      let out
      if (
        value === undefined ||
        value === null ||
        value?.toString === undefined ||
        typeof value === 'object'
      ) {
        try {
          out = JSON.stringify(value)
        } catch (err) {
          out = value
        }
      }

      return out
    }

    for (let index = 0; index < this.rows.length; index++) {
      const row = this.rows[index]
      const id = (index + 1)
      if (row) {
        const value = row.hasOwnProperty('value') ? row.value : row
        const data = {
          value: displayValue(value),
          id,
          key: String(row.label || id),
          type: row.type || 'input'
        }

        this.collection.add( new RowState(data) )
      }
    }
  },
  render () {
    this.renderWithTemplate()

    this.renderCollection(
      this.collection,
      (specs) => {
        const type = specs.model.type
        if (type === 'file') {
          return new TableRowFile(specs)
        } else if (specs.model.value && isJSON(specs.model.value)) {
          return new TableRowJSON(specs)
        } else {
          return new TableRowText(specs)
        }
      },
      this.query('table')
    )
  }
})

const TableRowFile = View.extend({
  template: `
    <tr>
      <th data-hook="key"></th>
      <td data-hook="value"></td>
    </tr>
  `,
  bindings: {
    'model.key': {
      type: 'text',
      hook: 'key'
    }
  },
  render () {
    this.renderWithTemplate()
    const value = this.model.value
    this.renderSubview(
      new DownloadButton({ value }),
      this.queryByHook('value')
    )
  }
})

const TableRowText = View.extend({
  template: `
    <tr>
      <th data-hook="key"></th>
      <td data-hook="value"></td>
    </tr>
  `,
  bindings: {
    'model.key': {
      type: 'text',
      hook: 'key'
    },
    'model.value': {
      type: 'text',
      hook: 'value'
    }
  },
  render () {
    this.renderWithTemplate()

    if (this.model.value) {
      this.renderSubview(
        new ClipboardButton({ value: this.model.value }),
        this.queryByHook('value')
      )
    }
  }
})
const TableRowJSON = View.extend({
  template: `
    <tr>
      <th data-hook="key"></th>
      <td data-hook="value"></td>
    </tr>
  `,
  bindings: {
    'model.key': {
      type: 'text',
      hook: 'key'
    }
  },
  render () {
    this.renderWithTemplate()

    if (this.model.value) {
      this.renderSubview(
        new ClipboardButton({ value: this.model.value }),
        this.queryByHook('value')
      )

      this.renderSubview(
        new JsonViewer({ json: JSON.parse(this.model.value) }),
        this.queryByHook('value')
      )
    }
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
