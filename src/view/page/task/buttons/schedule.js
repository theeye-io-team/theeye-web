import View from 'ampersand-view'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import FormView from 'ampersand-form-view'
import HelpIcon from 'components/help-icon'
import InputView from 'components/input-view'
import Datepicker from 'components/input-view/datepicker'

import { create } from 'actions/schedule'
import bootbox from 'bootbox'
const HelpTexts = require('language/help')

var humanInterval = require('lib/human-interval')
var CronTime = require('cron').CronTime
var moment = require('moment-timezone')

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

const ScheduleForm = FormView.extend({
  props: {
    isCron: ['boolean', true, false]
  },
  initialize (options) {
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

    this.fields = [
      new Datepicker({
        minDate: 'today',
        enableTime: true,
        required: true,
        altInput: false,
        label: 'When shall I run? *',
        name: 'datetime',
        dateFormat: 'F J, Y at H:i',
        value: '',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        placeholder: 'click to pick',
        tests: [
          item => {
            if (item.length === 0) {
              return 'Can\'t schedule without a date, please pick one'
            }
            return ''
          }
        ]
      }),
      frequencyInput
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('datetime')
    this.addHelpIcon('frequency')

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
    if (!this.valid) return

    const data = this.prepareData(this.data)

    create(this.model, data, () => {
      if (this.isCron) {
        // FuzzyMessage()
      }
    })
    this.trigger('submit')
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
        nextDate = cronTime._getNextDateFrom(dateForTimezone(new Date(lastRun.valueOf() + 1000)))
      }
      this.isCron = true
      nextRunAt = nextDate
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
    },
    // 'model.hasDinamicArguments': {
    //   type: 'toggle',
    //   invert: true
    // }
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

      this.listenTo(form, 'submit', modal.hide.bind(modal))

      modal.show()
    }
  }
})
