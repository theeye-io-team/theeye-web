import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'
import App from 'ampersand-app'
import { Workflow } from 'models/workflow'
import WorkflowFormView from '../form'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Copy workflow'
    this.iconClass = 'fa fa-copy dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      const recipe = App.actions.workflow.createRecipe(this.model.serialize(), {})
      const workflow = new Workflow(recipe)

      const form = new WorkflowFormView({ model: workflow })

      const modal = new Modalizer({
        buttons: false,
        title: `Copy # ${this.model.id}`,
        bodyView: form
      })

      // this.listenTo(modal, 'shown', () => { form.focus() })

      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })

      form.on('submit', data => {
        const recipe = App.actions.workflow.createRecipe(workflow.serialize())
        App.actions.workflow.importCreate(recipe)
        modal.hide()
      })

      modal.show()
    }
  }
})
