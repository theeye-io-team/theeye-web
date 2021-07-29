import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'
import ScheduleForm from './form'
import bootbox from 'bootbox'

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

      const form = new ScheduleForm({ model: this.model })

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
