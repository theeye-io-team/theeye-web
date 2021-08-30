import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import AmpersandCollection from 'ampersand-collection'
import AmpersandModel from 'ampersand-model'
import InputView from 'components/input-view'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import parser from 'cron-parser'
import { DateTime } from 'luxon'

import './scheduler.less'

export default FormView.extend({
  initialize () {
    this.nextDates = new AmpersandCollection([])

    const cronExpressionInput = new InputView({
      template: `
        <div>
          <label class="control-label" data-hook="label"></label>
          <div data-hook="input-container" class="">
            <input class="form-control form-input">
            <span data-hook="mask-toggle" class="fa form-control-feedback"></span>
            <div data-hook="message-container" class="message message-below message-error">
              <p data-hook="message-text"></p>
            </div>
          </div>
        </div>
      `,
      name: 'frequency',
      label: 'CRON job interval *',
      required: true,
      invalidClass: 'text-danger',
      visible: true,
      validityClassSelector: '.control-label',
      placeholder: '* * * * *',
      value: '',
      tests: [
        interval => {
          //if (!this._rendered) { return '' }
          if (!interval) { return '' }

          if (interval.split(' ').length !== 5) {
            return '5 fields are required'
          }

          try {
            parser.parseExpression(interval)
          } catch (err) {
            return err.message
          }

          return ''
        }
      ]
    })

    this.listenTo(cronExpressionInput, 'change:value', () => {
      this.updateNextIterations(cronExpressionInput)
    })

    this.fields = [ cronExpressionInput ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  props: {
    nextDates: 'collection'
  },
  template: `<div></div>`,
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('frequency')

    this.renderSubview(
      new SchedulePreview({ collection: this.nextDates })
    )

    const samples = new CronFormat()
    this.listenTo(samples, 'show:sample', (expression) => {
      this._fieldViews['frequency'].setValue(expression)
    })
    this.renderSubview(samples)

    this.renderSubview(new LocalTimezoneView())
  },
  updateNextIterations (frequency) {
    if (!frequency.value || !frequency.valid) {
      this.nextDates.reset()
      return
    }

    //const interval = parser.parseExpression(value, { utc: true })
    const interval = parser.parseExpression(frequency.value, {})
    const dates = []
    for (let count = 0; count < 5; count++) {
      let nextDate = interval.next().toDate()
      dates.push(new DateEntryModel({ date: nextDate.toString() }))
      //dates.push(new DateEntryModel({ date: nextDate.toUTCString() }))
    }

    this.nextDates.reset(dates)
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.scheduler.taskform[field]
      }),
      view.query('label')
    )
  },
  submit () {
    this.beforeSubmit()

    if (!this.valid) { return }

    const data = this.prepareData(this.data)
    App.actions.scheduler.create(this.model, data)
  },
  prepareData (data) {
    //const nextRun = parser.parseExpression(data.frequency).next().toDate()

    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: data.frequency,
      //datetime: nextRun
    }
  }
})

const DateEntryModel = AmpersandModel.extend({
  props: {
    date: 'date' // ?
  }
})

const SchedulePreview = View.extend({
  props: {
    collectionLength: ['number', false, 0]
  },
  bindings: {
    collectionLength: { type: 'toggle' }
  },
  template: `
    <div class="schedule-preview row">
      <div class="col-xs-12">
        <div>
          <h4>Next 5 run dates</h4>
        </div>
        <ul data-hook="date-list"></ul>
      </div>
    </div>
  `,
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.listenTo(this.collection, 'reset', () => {
      this.collectionLength = this.collection.length
    })
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCollection(
      this.collection,
      DateEntry,
      this.queryByHook('date-list')
    )
  }
})

const DateEntry = View.extend({
  template: '<li></li>',
  bindings: {
    'model.date': { type: 'text' }
  }
})

const CronFormat = View.extend({
  events: {
    'click table[data-hook=example] th':'onClickSample'
  },
  onClickSample (event) {
    const expression = event.target.innerHTML
    this.trigger('show:sample', expression)
  },
  template: `
    <div class="cron-format">
      <placeholder></placeholder>
      <div class="row">
        <pre class="col-sm-6">

        *  *  *  *  *
        ┬  ┬  ┬  ┬  ┬
        │  │  │  │  |
        │  │  │  │  └ day of week (0 - 7) (0 or 7 is Sun)
        │  │  │  └───── month (1 - 12)
        │  │  └────────── day of month (1 - 31, L)
        │  └─────────────── hour (0 - 23)
        └──────────────────── minute (0 - 59)

        *   any value
        ,   value list separator
        -   range of values
        /   step values

        </pre>
        <details class="col-sm-6">
          <summary class="btn btn-primary">Examples</summary> <br>
          <table data-hook="example">
            <tr><th>* * * * *</th> <td>Every minute </td></tr>
            <tr><th>15 */2 * * *</th> <td>Every 2 hours past 15 minutes </td></tr>
            <tr><th>0 9-17 * * *</th> <td>Every hour from 9 to 17 </td></tr>
            <tr><th>*/10 * * * 5</th> <td>Every 10 minutes on Fridays </td></tr>
            <tr><th>45 14 20 * *</th> <td>Every 20th day of the month at 14:45 </td></tr>
            <tr><th>*/30 * * 9 2,3,6</th> <td>Every half hour on Tuesdays, Wednesdays and Saturdays of September </td></tr>
            <tr><th>0 0 L * *</th> <td>Every last day of the month at midnight </td></tr>
            <tr><th>*/15 13-18 * * fri</th> <td>Every 15 minutes from 13 to 18 on Fridays </td></tr>
          </table>
        </details>
      </div>
    </div>
  `
})

const LocalTimezoneView = View.extend({
  template: () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const message = ``
    return (
      `<timezone>
        <p>Please note: The scheduler is using timezone: <b>${tz}</b></p>
      </timezone>`
    )
  }
})
