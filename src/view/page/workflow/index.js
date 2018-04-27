import App from 'ampersand-app'
import View from 'ampersand-view'
import Workflow from './workflow'

module.exports = View.extend({
  template: `
    <div class="admin-container">
      <div class="admin-panel">
        <h3>Workflow</h3>
        <div data-hook="workflow-container"></div>
      </div>
    </div>
  `,
  render() {
    this.renderWithTemplate(this)

    this.workflow = new Workflow({currentWorkflow: {}})
    this.renderSubview(this.workflow, this.queryByHook('workflow-container'))

    this.listenToAndRun(App.state.workflowPage, 'change:currentWorkflow', () => {
      this.workflow.currentWorkflow = App.state.workflowPage.currentWorkflow
    })
  }
})
