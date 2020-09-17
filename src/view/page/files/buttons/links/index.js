import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button.js'
import LinksDialog from './dialog'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Check links'
    this.iconClass = 'fa fa-link'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      //event.preventDefault()
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      App.actions.file.syncLinkedModels(this.model.id, () => {})

      let modal = new LinksDialog({ model: this.model })
      modal.show()
    }
  }
})
