import View from 'ampersand-view'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'
import bootbox from 'bootbox'
import CronWizard from './cron-wizard'
import DateSelector from './date-selector'
import SelectView from 'components/select2-view'
import Buttons from 'view/buttons'

export default PanelButton.extend({
  initialize (options) {
    this.title = options.title || 'Create schedule'
    this.iconClass = 'fa fa-clock-o dropdown-icon'
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
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      if (this.model.hasDynamicArguments) {
        bootbox.alert(`This ${this.model._type} requires user inputs,
          therefore cannot be scheduled.`)
        return
      }

      const body = new SchedulerBody({ model: this.model })

      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: body 
      })

      this.listenTo(modal, 'hidden', () => {
        body.remove()
        modal.remove()
      })

      this.listenTo(body, 'submitted', () => {
        modal.hide()
        //modal.hide.bind(modal)
      })

      modal.show()
    }
  }
})

const SchedulerBody = View.extend({
  template: `
    <div class="scheduler-form">
      <div data-hook="selector-placeholder"></div>
      <div data-hook='wizard-placeholder'></div>
    </div>
  `,
  events: {
    'click button[data-hook=confirm]': 'onClickSave'
  },
  onClickSave (event) {
    event.preventDefault()
    event.stopPropagation()

    this.form.submit()
    this.trigger('submitted')
  },
  render () {
    this.renderWithTemplate()

    this.renderSubview(new Buttons({ confirmText: 'Save' }), this.el)

    const selector = new SelectView({
      name: 'format',
      label: 'Select Format',
      multiple: false,
      options: [
        {text: "CRON", id: "cron" }, 
        {text: "Single Execution", id: "oneTime" }
      ],
      required: true,
      unselectedText: `Select a scheduler`,
      requiredMessage: 'Selection required',
      value: 'cron'
    })

    this.renderSubview(selector, this.queryByHook('selector-placeholder'))

    this.listenToAndRun(selector, 'change:value', () => {
      if (this.form) { this.form.remove() }
      Scheduler[selector.value].apply(this)
    })
  }
})

const Scheduler = {
  cron () {
    const form = new CronWizard({ model: this.model })
    this.renderSubview(form, this.queryByHook('wizard-placeholder'))
    this.form = form
  },
  human () {
    console.log('not supported')
  },
  oneTime () {
    const form = new DateSelector({ model: this.model })
    this.renderSubview(form, this.queryByHook('wizard-placeholder'))
    this.form = form
  }
}
