import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'
import App from 'ampersand-app'
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
      copyWorkflow(this.model)
    }
  }
})

export const copyWorkflow = (model) => {

  App.actions.workflow.populate(model)
  const form = new WorkflowFormView({ model })

  const modal = new Modalizer({
    buttons: false,
    title: `Copying Workflow ${model.name}`,
    bodyView: form
  })

  modal.on('hidden', () => {
    form.remove()
    modal.remove()
  })

  form.on('submit', data => {
    App.actions.workflow.create(data)
    modal.hide()
  })

  modal.show()
}
