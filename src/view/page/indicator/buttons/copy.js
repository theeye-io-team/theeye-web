import App from 'ampersand-app'
import FormView from '../form'
import Modalizer from 'components/modalizer'
import PanelButton from 'components/list/item/panel-button'
import Titles from 'language/titles'

export default PanelButton.extend({
  initialize (options) {
    this.title = Titles.indicator.buttons.copy
    this.iconClass = 'fa fa-copy dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const model = this.model.serialize()
      delete model.id
      delete model.secret
      
      const indicator = new App.Models.Indicator.Factory(model)
      const form = new FormView({ model: indicator })

      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: form
      })

      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })

      this.listenTo(form, 'submitted', () => {
        modal.hide()
      })

      modal.show()
    }
  }
})
