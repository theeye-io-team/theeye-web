import PanelButton from 'components/list/item/panel-button'
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

      FileActions.edit(this.model.id)
    }
  }
})
