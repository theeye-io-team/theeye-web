import App from 'ampersand-app'
import View from 'ampersand-view'
import { Workflow } from 'models/workflow'
import WorkflowFormView from '../../../form'

export default View.extend({
  template: `<div>
    <section data-hook="form-container"></section>
  </div>`,
  render () {
    this.renderWithTemplate(this)

    const recipe = App.actions.workflow.createRecipe(this.model.serialize(), {})
    this.createForm(new Workflow(recipe))
  },
  /**
   * @param {Resource} resource resource monitor instance
   */
  createForm (workflow) {
    const form = new WorkflowFormView({ model: workflow, copying: true })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form
    // form.on('submitted', () => { this.trigger('submitted') })
  },
  remove () {
    if (this.form) {
      this.form.remove()
    }

    View.prototype.remove.apply(this,arguments)
  }
})
