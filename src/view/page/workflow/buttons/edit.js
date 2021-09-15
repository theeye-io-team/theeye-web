import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import FormView from '../form'
import $ from 'jquery'

export default PanelButton.extend({
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
        title: `Edit # ${this.model.id}`,
        bodyView: form
      })

      this.listenTo(modal,'shown',() => { form.focus() })

      this.listenTo(modal,'hidden',() => {
        form.remove()
        modal.remove()
      })

      form.on('submit', data => {
        App.actions.workflow.update(this.model.id, data)
        modal.hide()
      })

      modal.show()
    }
  }
})
