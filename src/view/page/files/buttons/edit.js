import App from 'ampersand-app'
//import PanelButton from 'components/list/item/panel-button'
import CommonButton from 'components/common-button'
import $ from 'jquery'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'Edit file'
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
