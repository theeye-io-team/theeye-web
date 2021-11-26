import PanelButton from 'components/list/item/panel-button'
import $ from 'jquery'
import App from "ampersand-app"
import Titles from 'language/titles'

export default PanelButton.extend({
  initialize (options) {
    this.title = Titles.workflow.buttons.refresh
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')
      App.actions.onHold.checkWorkflow(this.model)
    }
  }
})
