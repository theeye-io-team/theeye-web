import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import WorkflowFormView from '../form'
import config from 'config'

import { Workflow } from 'models/workflow'

import './styles.less'

const docsLink = 'core-concepts/tasks/tasks_workflows/'

export default function () {

  const workflow = new Workflow({})
  const wizard = new WorkflowFormView({ model: workflow })

  const modal = new Modalizer({
    buttons: false,
    title: 'Create Workflow',
    bodyView: wizard
  })

  modal.renderSubview(
    new HelpIconView({ link: `${config.docs}/${docsLink}` }),
    modal.queryByHook('title')
  )

  modal.on('hidden',() => {
    wizard.remove()
    modal.remove()
  })

  wizard.on('submit', (data) => {
    App.actions.workflow.create(data)
    modal.hide()
  })

  modal.show()
  return modal
}
