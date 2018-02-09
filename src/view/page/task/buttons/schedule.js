import View from 'ampersand-view'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import FormView from 'ampersand-form-view'
import HelpIcon from 'components/help-icon'
import InputView from 'components/input-view'
import Datepicker from 'components/input-view/datepicker'
import AmpersandCollection from 'ampersand-collection'
import AmpersandModel from 'ampersand-model'
import MinMaxTimePlugin from 'flatpickr/dist/plugins/minMaxTimePlugin'

import { createSchedule } from 'actions/schedule'
import bootbox from 'bootbox'
const HelpTexts = require('language/help')

const humanInterval = require('lib/human-interval')
const CronTime = require('cron').CronTime
const moment = require('moment-timezone')

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
const DateEntry = View.extend({
  template: '<li></li>',
  bindings: {
    'model.date': {
      type: 'text',
      selector: ''
    }
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
    </div>`,
  render: function () {
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
const ScheduleForm = FormView.extend({
  props: {
    isCron: ['boolean', true, false]
  },
  initialize (options) {
    this.nextDates = new AmpersandCollection()

    const frequencyInput = new InputView({
      label: 'Then repeat every',
      name: 'frequency',
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
    let now = moment().add(5, 'minutes')
    minMaxTable[ now.format('YYYY-MM-DD') ] = {
      minTime: now.format('HH:mm')
    }

    const initialDateInput = new Datepicker({
      minDate: 'today',
      enableTime: true,
      plugins: [
        new MinMaxTimePlugin({ minMaxTable })
      ],
      required: true,
      altInput: false,
      label: 'When shall I run first? *',
      name: 'datetime',
      dateFormat: 'F J, Y at H:i',
      value: new Date( moment().add(5, 'minutes').format() ),
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
            return 'Can\t schedule a task to run in the past'
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
  onFrequencyChange: function (inputView, inputValue) {
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

    this.beforeSubmit()
    if (!this.isValid()) {
      return
    }

    const data = this.prepareData(this.data)

    createSchedule(this.model.id, data, () => {
      if (this.isCron) {
        // FuzzyMessage()
      }
    })
    this.trigger('submitted')
  },
  computeFromInterval (initialDate, interval) {
    var lastRun = initialDate || new Date()
    var nextRunAt
    var timezone = moment.tz.guess()
    function dateForTimezone (d) {
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
      try {
        if (!initialDate && humanInterval(interval)) {
          nextRunAt = lastRun.valueOf()
        } else {
          nextRunAt = lastRun.valueOf() + humanInterval(interval)
        }
      } catch (e) {}
    } finally {
      if (isNaN(nextRunAt)) {
        nextRunAt = undefined
        console.log('failed to calculate nextRunAt due to invalid repeat interval')
      }
    }
    return nextRunAt
  },
  prepareData (data) {
    return Object.assign(
      {},
      data,
      {
        task: this.model.id,
        scheduleData: {
          repeatEvery: data.frequency,
          runDate: new Date(data.datetime)
        }
      }
    )
  }
})
module.exports = PanelButton.extend({
  initialize (options) {
    this.title = `Schedule Task ${this.model.name}`
    this.tip = 'Schedule Task'
    this.iconClass = 'fa fa-clock-o'
    this.className = 'btn btn-primary'
  },
  bindings: Object.assign({}, PanelButton.prototype.bindings, {
    'model.hasSchedules': {
      type: 'booleanClass',
      yes: 'hilite',
      no: '',
      selector: 'button'
    }
  }),
  events: {
    click (event) {
      event.stopPropagation()

      // TODO: schedules for dynamically argumented
      // tasks are not supported
      if (this.model.hasDinamicArguments) {
        let deniedMessage = [
          'Scheduling tasks with dynamic arguments',
          '(input/select) is not supported'
        ].join(' ')
        bootbox.alert(deniedMessage)
        return
      }

      const form = new ScheduleForm({
        model: this.model
      })

      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: form
      })

      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })

      this.listenTo(form, 'submitted', modal.hide.bind(modal))

      modal.show()
    }
  }
})
