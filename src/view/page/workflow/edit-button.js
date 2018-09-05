import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import FormView from './form'
import $ from 'jquery'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Edit workflow'
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const form = new FormView({
        model: this.model
      })
      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: form
      })

      this.listenTo(modal,'shown',() => { form.focus() })

      this.listenTo(modal,'hidden',() => {
        form.remove()
        modal.remove()
      })

      this.listenTo(form,'submitted',() => {
        modal.hide()
      })

      modal.show()
    }
  }
})
