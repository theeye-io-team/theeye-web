import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'

module.exports = PanelButton.extend({
  initialize (options) {
    this.title = 'View workflow'
    this.iconClass = 'fa fa-sitemap dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      this.renderWorkflowModal()
    }
  },
  renderWorkflowModal () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(WorkflowView => {
        this.workflowGraph = new WorkflowView({
          graph: this.model.graph
        })

        const modal = new Modalizer({
          buttons: false,
          title: this.title,
          bodyView: this.workflowGraph,
          class: 'workflow-viewer'
        })

        this.listenTo(modal,'shown',() => {
          App.state.loader.visible = true
          setTimeout(() => {
            this.workflowGraph.updateCytoscape()
            App.state.loader.visible = false
          }, 1000)
        })

        this.listenTo(modal,'hidden',() => {
          this.workflowGraph.remove()
          modal.remove()
        })

        modal.show()
    })
  }
})
