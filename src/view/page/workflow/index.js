import App from 'ampersand-app'
import View from 'ampersand-view'
//import WorkflowView from 'view/workflow'
import './style.less'

module.exports = View.extend({
  template: `
    <div class="workflow-page admin-container">
      <div class="admin-panel">
        <h3>Workflow</h3>
        <div data-hook="workflow-container"></div>
      </div>
    </div>
  `,
  render() {
    this.renderWithTemplate(this)
    this.renderWorkflowView()
  },
  renderWorkflowView () {
    let currentWorkflow = App.state.workflowPage.currentWorkflow

    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(WorkflowView => {

        this.workflow = new WorkflowView({
          graph: currentWorkflow
        })

        this.renderSubview(this.workflow, this.queryByHook('workflow-container'))

        this.listenTo(
          App.state.workflowPage,
          'change:currentWorkflow',
          () => {
            this.workflow.graph = currentWorkflow
          }
        )
      })
  }
})
