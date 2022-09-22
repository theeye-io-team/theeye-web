import App from 'ampersand-app'
import { Workflow } from 'models/workflow'
import WorkflowEditorView from './editor'
import FullPageModalizer from 'components/fullpagemodalizer'
import HelpIconView from 'components/help-icon'
//import config from 'config'

const docsLink = 'core-concepts/tasks/tasks_workflows/'

export default (workflow = null) => {
  if (workflow === null) {
    workflow = new Workflow({ version: 2 })
  }

  const editorView = new WorkflowEditorView({ model: workflow, builder_mode: 'import' })

  const modal = new FullPageModalizer({
    buttons: false,
    title: 'Create Workflow',
    bodyView: editorView 
  })

  modal.renderSubview(
    new HelpIconView({ link: `${App.config.docs}/${docsLink}` }),
    modal.queryByHook('title')
  )

  modal.on('hidden', () => {
    editorView.remove()
    modal.remove()
  })

  editorView.on('submit', (data) => {
    App.actions.workflow.create(data)
    modal.hide()
  })

  modal.show()
  return modal
}
