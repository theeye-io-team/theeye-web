import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import AmpersandModel from 'ampersand-model'
import AmpersandCollection from 'ampersand-collection'
import InputView from 'components/input-view'
import Datepicker from 'components/input-view/datepicker'
import CheckboxView from 'components/checkbox-view'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import View from 'ampersand-view'
import MinMaxTimePlugin from 'flatpickr/dist/plugins/minMaxTimePlugin'
import bootbox from 'bootbox'
import $ from 'jquery'
import HelpTexts from 'language/help'
import humanInterval from 'lib/human-interval'
import { DateTime } from "luxon"
// import cronTranslate from "./cron-translate" //UNUSED
const parser = require('cron-parser')

export default FormView.extend({
  props: {
    isCron: ['boolean', false, undefined],
    localToggled: ['boolean', true, false]
  },
  initialize (options) {
    this.nextDates = new AmpersandCollection()

    const formatSelector = new SelectView({
      name: 'format',
      label: 'CRON or human format? *',
      multiple: false,
      options: [
        {text: "CRON", id: "cron"}, 
        {text: "Human format", id: "human"}
      ],
      required: true,
      unselectedText: `Select a format`,
      requiredMessage: 'Selection required'
    })

    const frequencyInput = new InputView({
      name: 'frequency',
      label: this.isCron ? 'CRON job interval *' : 'Then repeat every',
      required: false,
      invalidClass: 'text-danger',
      visible: this.isCron !== undefined,
      validityClassSelector: '.control-label',
      placeholder: this.isCron ? "* * * * *" : '1 day',
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
          if (this.isCron) {
            // if interval doesn't match RegEx, don't valid
            // src: http://regexr.com/4jp54
            let regex = new RegExp (
              /(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/
            )
            if (!regex.test(interval)) {
              return 'Not a valid CRON job. Please recheck'
            }
            return ''
          }            
          else {
            let nextRun = this.computeFromInterval(this._fieldViews.datetime.value[0], interval)
            // if next date is valid, parse valid
            if (nextRun) {
              return ''
            }
          }
          return 'That doesn\'t look like a valid interval'
        }
      ]
    })

    let minMaxTable = {}
    let now = DateTime.now().plus({minutes: 2})
    minMaxTable[ now.toFormat('YYYY-MM-DD') ] = {
      minTime: now.toFormat('HH:mm'),
      maxTime: "23:59"
    }

    const initialDateInput = new Datepicker({
      name: 'datetime',
      minDate: 'today',
      enableTime: true,
      plugins: [
        new MinMaxTimePlugin({ table: minMaxTable })
      ],
      required: this.isCron == false,
      altInput: false,
      visible: this.isCron !== undefined,
      label: 'When shall I run first? *',
      dateFormat: 'F J, Y at H:i',
      value: new Date( DateTime.now().plus({minutes: 2}).toISO() ),
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      placeholder: 'click to pick',
      tests: [
        items => {
          if (items.length === 0 && !this.isCron) {
            return 'Can\'t schedule without a date, please pick one'
          }
          return
        },
        items => {
          if (!this.isCron) {
            let now = DateTime.now()
            let picked = DateTime.fromJSDate(items[0])
            
            if (picked.valueOf < now.valueOf) {
              return 'Can\'t schedule a task to run in the past'
            }
          }

          return
        }
      ]
    })

    const switchTimezone = new CheckboxView({
      required: false,
      visible: false,
      label: 'View in local timezone',
      name: 'switchTimezone',
      value: (this.localToggled !== false)
    })

    this.fields = [
      formatSelector,
      initialDateInput,
      frequencyInput,
      switchTimezone
    ]

    FormView.prototype.initialize.apply(this, arguments)
    this.listenTo(formatSelector, 'change:value', () => {
      if(this._fieldViews['format'].value == 'cron') {
        this.isCron = true
        this.preview.isCron = true
      } 
      else {
        this.isCron = false
        this.preview.isCron = false
      } 
      
      this._fieldViews['frequency'].placeholder = (this.isCron ? "* * * * *" : '1 day')
      this._fieldViews['frequency'].visible = true
      this._fieldViews['frequency'].label = (this.isCron ? 'CRON job interval *' : 'Then repeat every'),
      this._fieldViews['frequency'].required = (this.isCron == true)
      this._fieldViews['datetime'].visible = (this.isCron == false)
      this._fieldViews['datetime'].required = (this.isCron == false)
      this._fieldViews['switchTimezone'].visible = (this.isCron == true)
    })
    this.listenTo(frequencyInput, 'change:value', this.onFrequencyChange)
    this.listenTo(initialDateInput, 'change:value', this.onFrequencyChange)
    this.listenTo(switchTimezone, 'change:value', this.onFrequencyChange)
  },
  onFrequencyChange (inputView, inputValue) {
    // since this handle serves as listener for both
    // inputViews don't trust arguments,
    // get value from input view as a 'this' reference
    const value = this._fieldViews['frequency'].value
    this.localToggled = this._fieldViews['switchTimezone'].value
    if (
      this._fieldViews['datetime'].valid &&
      this._fieldViews['frequency'].value &&
      this._fieldViews['frequency'].valid
    ) {
      let initialDate = null
      try {
        initialDate = new Date(this._fieldViews['datetime'].value)

        const dates = []

        if (this.isCron) {
          let interval = parser.parseExpression(value, { utc: true })
          for (let i = 0; i < 5; i++) {
            let nextDate = interval.next().toDate()
            if (this.localToggled)
              dates.push(new DateEntryModel({ date: nextDate.toString() }))
            else
              dates.push(new DateEntryModel({ date: nextDate.toUTCString() }))
          }
        }
        else if (this.isCron === false) {
          for (let i = 0; i < 5; i++) {
            initialDate = new Date(this.computeFromInterval(initialDate, value))
            dates.push(new DateEntryModel({date: initialDate.toString()}))
          }
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

    this.preview = new SchedulePreview({
      collection: this.nextDates,
      isCron: this.isCron
    })

    this.renderSubview(this.preview)

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

    const dateForTimezone = (d) => {
      d = DateTime.fromJSDate(d)
      return d
    }

    lastRun = dateForTimezone(lastRun)

    if (!initialDate && humanInterval(interval)) {
      nextRunAt = lastRun.valueOf()
    } else {
      nextRunAt = lastRun.valueOf() + humanInterval(interval)
    }

    if (isNaN(nextRunAt)) {
      nextRunAt = undefined
    }

    return nextRunAt
  },
  prepareData (data) {
    // Translate cron expression to UTC timezone (unused)
    /*
    if (this.isCron && this.localToggled) {
      data.frequency = cronTranslate(data.frequency, -3)
    }
    */
    return {
      frequency: data.frequency,
      datetime:
        this.isCron
          ? parser.parseExpression(
              data.frequency,
              { utc: true }
            ).next().toDate()
          : data.datetime[0]
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
    actionText: { hook: 'action' }
  },
  render () {
    this.renderWithTemplate(this)
    this.queryByHook('action').onclick = this.action
  }
})

const DateEntryModel = AmpersandModel.extend({
  props: {
    date: 'string'
  }
})

const SchedulePreview = View.extend({
  props: {
    visible: ['boolean', true, false],
    localToggled: ['boolean', true, true],
    isCron: ['boolean', false, false]
  },
  bindings: {
    visible: {
      type: 'toggle'
    }
  },
  template: `
    <div class="schedule-preview row">
      <div class="col-xs-12">
        <div>
          <h4>Next 5 run dates </h4>
        </div>
        <ul data-hook="date-list"></ul>
        <h2 id="utc">CRON jobs are computed in the UTC timezone</h2>
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
      this.query("#utc").innerHTML = (this.isCron ? "CRON jobs are computed in the UTC timezone" : "")
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
