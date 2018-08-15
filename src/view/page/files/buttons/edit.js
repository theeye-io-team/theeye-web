import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'

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

      App.actions.file.edit(this.model.id)
    }
  }
})
