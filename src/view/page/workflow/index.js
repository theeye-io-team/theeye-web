import App from 'ampersand-app'
import View from 'ampersand-view'
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

        const workflowView = new WorkflowView({
          graph: App.state.workflowPage.currentWorkflow
        })

        this.renderSubview(workflowView, this.queryByHook('workflow-container'))

        this.listenToAndRun(
          App.state.workflowPage,
          'change:currentWorkflow',
          () => {
            workflowView.graph = App.state.workflowPage.currentWorkflow
          }
        )
      })
  }
})
