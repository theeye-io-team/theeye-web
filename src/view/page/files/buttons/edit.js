import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import FileForm from '../form'
import FileActions from 'actions/file'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Edit File'
    this.tip = 'Edit File'
    this.iconClass = 'fa fa-edit'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.preventDefault()
      event.stopPropagation()

      // pre fetch extra file data
      FileActions.get(this.model.id)

      const form = new FileForm({ model: this.model })
      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: form
      })
      this.listenTo(modal, 'shown', () => { form.focus() })
      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })
      this.listenTo(form, 'submit', () => {
        modal.hide()
      })
      modal.show()
    }
  }
})
