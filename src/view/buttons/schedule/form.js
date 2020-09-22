import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import AmpersandModel from 'ampersand-model'
import AmpersandCollection from 'ampersand-collection'
import InputView from 'components/input-view'
import Datepicker from 'components/input-view/datepicker'
import HelpIcon from 'components/help-icon'
import View from 'ampersand-view'
import MinMaxTimePlugin from 'flatpickr/dist/plugins/minMaxTimePlugin'
import bootbox from 'bootbox'
import $ from 'jquery'
import HelpTexts from 'language/help'
import humanInterval from 'lib/human-interval'
import { CronTime } from 'cron'
import moment from 'moment-timezone'

export default FormView.extend({
  props: {
    isCron: ['boolean', true, false]
  },
  initialize (options) {
    this.nextDates = new AmpersandCollection()

    const frequencyInput = new InputView({
      name: 'frequency',
      label: 'Then repeat every',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      placeholder: '1 day',
      value: '',
      tests: [
        interval => {
          if (!this._rendered) {
            return ''
          }
          // if date is not set, don't validate this field
          if (!this._fieldViews.datetime.value || !this._fieldViews.datetime.value.length) {
            return ''
          }
          // if empty, don't validate either
          if (!interval) {
            return ''
          }
          let nextRun = this.computeFromInterval(this._fieldViews.datetime.value[0], interval)
          // if next date is valid, parse valid
          if (nextRun) {
            return ''
          }
          return 'That doesn\'t look like a valid interval'
        }
      ]
    })

    let minMaxTable = {}
    let now = moment().add(2, 'minutes')
    minMaxTable[ now.format('YYYY-MM-DD') ] = {
      minTime: now.format('HH:mm'),
      maxTime: "23:59"
    }

    const initialDateInput = new Datepicker({
      name: 'datetime',
      minDate: 'today',
      enableTime: true,
      plugins: [
        new MinMaxTimePlugin({ table: minMaxTable })
      ],
      required: true,
      altInput: false,
      label: 'When shall I run first? *',
      dateFormat: 'F J, Y at H:i',
      value: new Date( moment().add(2, 'minutes').format() ),
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      placeholder: 'click to pick',
      tests: [
        items => {
          if (items.length === 0) {
            return 'Can\'t schedule without a date, please pick one'
          }
          return
        },
        items => {
          let now = moment(new Date())
          let picked = moment(items[0])

          if (picked.isBefore(now) === true) {
            return 'Can\'t schedule a task to run in the past'
          }

          return
        }
      ]
    })

    this.fields = [
      initialDateInput,
      frequencyInput
    ]

    FormView.prototype.initialize.apply(this, arguments)
    this.listenTo(frequencyInput, 'change:value', this.onFrequencyChange)
    this.listenTo(initialDateInput, 'change:value', this.onFrequencyChange)
  },
  onFrequencyChange (inputView, inputValue) {
    // since this handle serves as listener for both
    // inputViews don't trust arguments,
    // get value from input view as a 'this' reference
    const value = this._fieldViews['frequency'].value
    if (
      this._fieldViews['datetime'].valid &&
      this._fieldViews['frequency'].value &&
      this._fieldViews['frequency'].valid
    ) {
      let initialDate = null
      try {
        initialDate = new Date(this._fieldViews['datetime'].value)

        const dates = []

        for (let i = 0; i < 5; i++) {
          initialDate = new Date(this.computeFromInterval(initialDate, value))
          dates.push(new DateEntryModel({date: initialDate}))
        }

        this.nextDates.reset()
        this.nextDates.reset(dates)
      } catch (e) {}
    } else {
      this.nextDates.reset()
    }
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('datetime')
    this.addHelpIcon('frequency')

    const preview = new SchedulePreview({collection: this.nextDates})
    this.renderSubview(preview)

    const buttons = new ModalButtons({action: this.submit.bind(this)})
    this.renderSubview(buttons)
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
  submit (event) {
    event.preventDefault()
    event.stopPropagation()
    this.beforeSubmit()
    if (!this.valid) { return }

    const data = this.prepareData(this.data)
    App.actions.scheduler.create(this.model, data)
    this.trigger('submitted')
  },
  computeFromInterval (initialDate, interval) {
    var lastRun = initialDate || new Date()
    var nextRunAt
    var timezone = moment.tz.guess()

    const dateForTimezone = (d) => {
      d = moment(d)
      if (timezone) d.tz(timezone)
      return d
    }

    this.isCron = false

    lastRun = dateForTimezone(lastRun)
    try {
      var cronTime = new CronTime(interval)
      var nextDate = cronTime._getNextDateFrom(lastRun)
      if (nextDate.valueOf() == lastRun.valueOf()) {
        // Handle cronTime giving back the same date for the next run time
        nextDate = cronTime._getNextDateFrom(dateForTimezone(lastRun.valueOf() + 1000))
      }
      this.isCron = true
      nextRunAt = nextDate.valueOf()
    } catch (e) {
      // Nope, humanInterval then!
      if (!initialDate && humanInterval(interval)) {
        nextRunAt = lastRun.valueOf()
      } else {
        nextRunAt = lastRun.valueOf() + humanInterval(interval)
      }
    } finally {
      if (isNaN(nextRunAt)) {
        nextRunAt = undefined
      }
    }
    return nextRunAt
  },
  prepareData (data) {
    return {
      frequency: data.frequency,
      datetime: data.datetime[0]
    }
  }
})

const ModalButtons = View.extend({
  template: `
    <div id="schedule-form-buttons" data-hook="buttons-container">
      <div>
        <button
          type="button"
          class="btn btn-default btn-block btn-lg"
          data-dismiss="modal">Cancel</button>
        <button
          type="button"
          class="btn btn-primary btn-block btn-lg"
          data-hook="action"></button>
      </div>
    </div>`,
  props: {
    actionText: ['string', true, 'Save'],
    action: ['any', true, event => { event && event.preventDefault() }]
  },
  bindings: {
    actionText: {hook: 'action'}
  },
  render () {
    this.renderWithTemplate(this)
    this.queryByHook('action').onclick = this.action
  }
})

const DateEntryModel = AmpersandModel.extend({
  props: {
    date: 'date'
  }
})

const SchedulePreview = View.extend({
  props: {
    visible: ['boolean', true, false]
  },
  bindings: {
    visible: {
      type: 'toggle'
    }
  },
  template: `
    <div class="schedule-preview row">
      <div class="col-xs-12">
        <h4>Next 5 run dates</h4>
        <ul data-hook="date-list"></ul>
      </div>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)
    this.renderCollection(
      this.collection,
      DateEntry,
      this.queryByHook('date-list')
    )

    this.listenToAndRun(this.collection, 'reset', () => {
      this.visible = Boolean(this.collection.length)
    })
  }
})

const DateEntry = View.extend({
  template: '<li></li>',
  bindings: {
    'model.date': {
      type: 'text',
      selector: ''
    }
  }
})
