import App from 'ampersand-app'
import View from 'ampersand-view'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'

const WorkflowViewContainer = View.extend({
  template: `
    <div>
      <div class="row" style="margin-bottom:10px;">
        <div class="col-sm-12">
          <span style="font-weight:400;"> Name: </span>
          <span data-hook="name"> </span>
        </div>
      </div>
      <div class="row" style="margin-bottom:10px;">
        <div class="col-sm-12">
          <span style="font-weight:400;"> Description: </span>
          <span data-hook="description"> </span>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12 workflow-viewer" data-hook="graph-preview"></div>
      </div>
    </div>
  `,
  bindings: {
    'model.name': {
      hook:'name'
    },
    'model.description': {
      hook:'description'
    },
  },
  render() {
    this.renderWithTemplate(this)

    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(WorkflowView => {
        this.workflowGraph = new WorkflowView({
          graph: this.model.graph
        })

        this.renderSubview(this.workflowGraph, this.queryByHook('graph-preview'))
      })
  }
})

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
    this.WorkflowViewContainer = new WorkflowViewContainer({
      model: this.model
    })

    const modal = new Modalizer({
      buttons: false,
      title: this.title,
      bodyView: this.WorkflowViewContainer,
      class: 'workflow-viewer'
    })

    this.listenTo(modal,'shown',() => {
      App.state.loader.visible = true
      setTimeout(() => {
        this.WorkflowViewContainer.workflowGraph.updateCytoscape()
        App.state.loader.visible = false
      }, 1000)
    })

    this.listenTo(modal,'hidden',() => {
      this.WorkflowViewContainer.workflowGraph.remove()
      this.WorkflowViewContainer.remove()
      modal.remove()
    })

    modal.show()
  }
})
