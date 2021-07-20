import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import FormView from '../form'
import $ from 'jquery'
import App from "ampersand-app"
import Titles from 'language/titles'

export default PanelButton.extend({
  initialize (options) {
    this.title = Titles.task.buttons.refresh
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')
      App.actions.onHold.checkTask(this.model);
    }
  }
})
