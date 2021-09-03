import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import bootbox from 'bootbox'
import moment from 'moment'
import acls from 'lib/acls'
import './style.less'
import Modalizer from 'components/modalizer'
import Datepicker from 'components/input-view/datepicker'
import MinMaxTimePlugin from 'flatpickr/dist/plugins/minMaxTimePlugin'
import { DateTime } from 'luxon'
const cronParser = require('cron-parser')

export const Schedules = View.extend({
  template: `
    <div data-component="schedules-list">
      <h4>Schedules list</h4>
      <div data-hook="schedule-list"></div>
    </div>
  `,
  bindings: {
    'model.hasSchedules': {
      type: 'toggle',
      selector: ''
    }
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCollection(
      this.model.schedules,
      ScheduleRow,
      this.queryByHook('schedule-list'),
      {
        viewOptions: {
          scheduledModel: this.model
        }
      }
    )
  }
})

export default Schedules

const ScheduleRow = View.extend({
  props: {
    scheduledModel: ['state', true]
  },
  template: `
    <div class="scheduleItem row">
      <div class="col-xs-12">
        <h4>
          <div class="scheduleData">
            <span class="scheduleTitle">Repeats every: </span>
            <span data-hook="repeatsEvery"></span>
            <span class="breakline" style="display:none;"><br></span>
            <span class="scheduleTitle">Next iteration: </span>
            <span data-hook="nextDate"></span>
            <span data-hook="buttons">
              <a href="#" data-hook="delete" class="btn-primary btn delete-schedule">
                <span class="fa fa-trash"></span>
              </a>
              <span data-hook="pauseToggle" class="btn btn-primary"></span>
            </span>
          </div>
        </h4>
      </div>
    </div>
  `,
  render () {
    this.renderWithTemplate()
    if (!acls.hasAccessLevel('admin')) {
      //this.queryByHook('buttons').style.display = 'none'
      this.queryByHook('buttons').remove()
    }
  },
  events: {
    'click [data-hook=delete]': function (event) {
      bootbox.confirm({
        buttons: {
          confirm: {
            label: 'Delete schedule',
            className: 'btn-danger'
          }
        },
        message: 'The schedule will be deleted. Want to continue?',
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) {
            App.actions.scheduler.cancel(this.scheduledModel, this.model)
          }
        }
      })
    },
    'click [data-hook=pauseToggle]': 'onClickToggleSchedule'
  },
  bindings: {
    'model.data.scheduleData.repeatEvery': {
      hook: 'repeatsEvery',
      type: function (el, value, previousValue) {
        if (!value) {
          el.innerHTML = 'Runs once'
        } else {
          el.innerHTML = value
        }
      }
    },
    'model.nextRunAt': {
      hook: 'nextDate',
      type: function (el, value, previousValue) {
        el.innerHTML = moment(value).format('dddd, MMMM Do YYYY, h:mm:ss a')
      }
    },
    'model.disabled': {
      hook: 'pauseToggle',
      type: function (el, disabled, previousValue) {
        if (disabled) {
          el.innerHTML = `<span class="fa fa-play"></span> Resume schedule`
        } else {
          el.innerHTML = '<span class="fa fa-pause"></span> Pause schedule'
        }
      }
    }
  },
  onClickToggleSchedule (event) {
    if (this.model.disabled === false) {
      App.actions.scheduler.disabledToggle(this.model)
    } else {
      const repetition = this.model.data.scheduleData.repeatEvery
      const cronInterval = parseCronExpression(repetition)
      if (cronInterval !== null) {
        App.actions.scheduler.disabledToggle(this.model)
      } else {
        this.renderNextRunInput()
      }
    }
  },
  renderNextRunInput () {
    const form = new NextRun({ model: this.model })
    const modal = new Modalizer({
      buttons: false,
      title: 'Resume schedule',
      bodyView: form
    })

    this.listenTo(modal, 'hidden', () => {
      form.remove()
      modal.remove()
    })

    this.listenTo(form, 'submitted', () => {
      modal.hide()
    })

    modal.show()
  }
})

const NextRun = FormView.extend({
  initialize (options) {
    let minMaxTable = {}
    let now = DateTime.now().plus({minutes: 2})
    minMaxTable[ now.toFormat('YYYY-MM-DD') ] = {
      minTime: now.toFormat('HH:mm'),
      maxTime: "23:59"
    }

    const dateInput = new Datepicker({
      name: 'datetime',
      minDate: 'today',
      enableTime: true,
      plugins: [
        new MinMaxTimePlugin({ table: minMaxTable })
      ],
      required: true,
      altInput: false,
      visible: true,
      label: 'When shall I run next? *',
      dateFormat: 'F J, Y at H:i',
      value: new Date( DateTime.now().plus({minutes: 2}).toISO() ),
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
          const now = DateTime.now()
          const picked = DateTime.fromJSDate(items[0])
          if (picked.valueOf < now.valueOf) {
            return 'Can\'t schedule a task to run in the past'
          }

          return
        }
      ]
    })
    this.fields = [dateInput]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    const buttons = new ModalButtons({
      action: () => {
        App.actions.scheduler.disabledToggle(
          this.model,
          new Date(this._fieldViews['datetime'].value)
        )
        this.trigger('submitted')
      }
    })
    this.renderSubview(buttons)
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

const parseCronExpression = (expression) => {
  try {
    return cronParser.parseExpression(expression, { currentDate: new Date() })
  } catch (err) {
    return null
  }
}
