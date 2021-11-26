import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import FormView from '../form'
import config from 'config'

import { Workflow } from 'models/workflow'

import './styles.less'

const docsLink = 'core-concepts/tasks/tasks_workflows/'

export default function () {

  const workflow = new Workflow({ version: 2 })
  const form = new FormView({ model: workflow, create: true })

  const modal = new Modalizer({
    buttons: false,
    title: 'Create Workflow',
    bodyView: form 
  })

  modal.renderSubview(
    new HelpIconView({ link: `${config.docs}/${docsLink}` }),
    modal.queryByHook('title')
  )

  modal.on('hidden',() => {
    form.remove()
    modal.remove()
  })

  form.on('submit', (data) => {
    App.actions.workflow.create(data)
    modal.hide()
  })

  modal.show()
  return modal
}
