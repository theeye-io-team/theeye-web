import Datepicker from 'components/input-view/datepicker'
import { DateTime } from "luxon"
import FormView from 'ampersand-form-view'
import MinMaxTimePlugin from 'flatpickr/dist/plugins/minMaxTimePlugin'
import App from 'ampersand-app'
import HelpTexts from 'language/help'
import HelpIcon from 'components/help-icon'

export default FormView.extend({
  initialize (options) {
    const minMaxTable = {}
    const now = DateTime.now().plus({ minutes: 2 })
    minMaxTable[ now.toFormat('YYYY-MM-DD') ] = {
      minTime: now.toFormat('HH:mm'),
      maxTime: "23:59"
    }

    const datePicker = new Datepicker({
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
      name: 'datetime',
      minDate: 'today',
      enableTime: true,
      plugins: [
        new MinMaxTimePlugin({ table: minMaxTable })
      ],
      required: true,
      altInput: false,
      visible: true,
      label: 'When shall it run? *',
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
          let now = DateTime.now()
          let picked = DateTime.fromJSDate(items[0])

          if (picked.valueOf < now.valueOf) {
            return 'Can\'t schedule a task to run in the past'
          }

          return
        }
      ]
    })

    this.fields = [ datePicker ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  submit () {
    this.beforeSubmit()
    if (!this.valid) { return }

    const data = this.prepareData(this.data)
    App.actions.scheduler.create(this.model, data)
    this.trigger('submitted')
  },
  prepareData (data) {
    return {
      nextRunAt: null, 
      frequency: null,
      datetime: data.datetime[0]
    }
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('datetime')
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
  }
})
