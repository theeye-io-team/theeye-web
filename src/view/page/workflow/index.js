import App from 'ampersand-app'
import View from 'ampersand-view'
//import WorkflowView from 'view/workflow'
import './style.less'

export default View.extend({
  template: `
    <div class="workflow-page admin-container">
      <div class="admin-panel">
        <h3>Workflow</h3>
        <div data-hook="workflow-container"></div>
      </div>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)
    this.renderWorkflowView()
  },
  renderWorkflowView () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(({ default: WorkflowView }) => {

        var workflow = this.workflow = new WorkflowView({
          graph: App.state.workflowPage.currentWorkflow
        })

        this.renderSubview(workflow, this.queryByHook('workflow-container'))

        this.listenToAndRun(
          App.state.workflowPage,
          'change:currentWorkflow',
          () => {
            workflow.graph = App.state.workflowPage.currentWorkflow
          }
        )
      })
  }
})
