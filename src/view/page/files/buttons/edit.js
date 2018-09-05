import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import $ from 'jquery'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'Edit file'
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.preventDefault()
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      App.actions.file.edit(this.model.id)
    }
  }
})
