import App from 'ampersand-app'
import CommonButton from 'components/common-button'

export default CommonButton.extend({
  initialize (options) {
    this.title = 'Edit'
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
