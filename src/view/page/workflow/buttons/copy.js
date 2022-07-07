import PanelButton from 'components/list/item/panel-button'
import FullPageModalizer from 'components/fullpagemodalizer'
import $ from 'jquery'
import App from 'ampersand-app'
import WorkflowEditorView from '../editor'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'Copy'
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
  const editorView = new WorkflowEditorView({ model })

  const modal = new FullPageModalizer({
    buttons: false,
    title: `Copying Workflow ${model.name}`,
    bodyView: editorView
  })

  modal.on('hidden', () => {
    editorView.remove()
    modal.remove()
  })

  editorView.on('submit', data => {
    App.actions.workflow.create(data)
    modal.hide()
  })

  modal.show()
}
