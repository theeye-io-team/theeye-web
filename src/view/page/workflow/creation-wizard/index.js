import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import WorkflowFormView from '../form'
import config from 'config'

import { Workflow } from 'models/workflow'

import './styles.less'

const docsLink = 'core-concepts/tasks/tasks_workflows/'

export default function () {
  const wizard = new WorkflowCreationWizard()
  wizard.render()

  const modal = new Modalizer({
    buttons: false,
    title: 'Create Workflow',
    bodyView: wizard
  })

  modal.renderSubview(
    new HelpIconView({
      link: `${config.docs}/${docsLink}`
    }),
    modal.queryByHook('title')
  )

  modal.on('hidden',() => {
    wizard.remove()
    modal.remove()
  })

  wizard.on('submitted',() => { modal.hide() })
  modal.show()
  modal.wizard = wizard
  return modal
}

const WorkflowCreationWizard = View.extend({
  template: `<div><section data-hook="form-container"></section></div>`,
  render () {
    this.renderWithTemplate(this)

    this.createForm( new Workflow({}) )
  },
  /**
   * @param {Resource} resource resource monitor instance
   */
  createForm (workflow) {
    const form = new WorkflowFormView({ model: workflow })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form
    //form.on('submitted', () => { this.trigger('submitted') })
    form.on('submit', (data) => {
      App.actions.workflow.create(data)
      this.trigger('submitted')
    })
  },
  remove () {
    if (this.form) {
      this.form.remove()
    }

    View.prototype.remove.apply(this,arguments)
  }
})
