import App from 'ampersand-app'
import View from 'ampersand-view'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import './styles.less'

import DOMPurify from 'dompurify'

export default PanelButton.extend({
  initialize (options) {
    this.title = 'View workflow'
    this.iconClass = 'fa fa-sitemap dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      event.preventDefault()
      this.renderWorkflowModal()
    }
  },
  renderWorkflowModal () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(({ default: WorkflowView }) => {
        const workflowGraph = new WorkflowView({ graph: this.model.graph })

        const workflowGraphContainer = new WorkflowViewContainer({
          name: this.model.name,
          description: this.model.description,
          graph: workflowGraph
        })

        const modal = new Modalizer({
          buttons: false,
          title: this.title,
          bodyView: workflowGraphContainer,
          class: 'workflow-viewer'
        })

        this.listenTo(modal,'shown',() => {
          App.state.loader.visible = true
          setTimeout(() => {
            workflowGraph.updateCytoscape()
            App.state.loader.visible = false
          }, 1000)
        })

        this.listenTo(modal,'hidden',() => {
          workflowGraphContainer.remove()
          modal.remove()
        })

        modal.show()
      })
  }
})

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
          <span data-hook="saneDescription"> </span>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12 workflow-viewer" data-hook="graph-preview"></div>
      </div>
    </div>
  `,
  bindings: {
    'name': { hook:'name' },
    'saneDescription': {
      type: 'innerHTML',
      hook: 'saneDescription'
    }
  },
  props: {
    name: 'string',
    description: 'string',
    graph: 'state'
  },
  derived: {
    saneDescription: {
      deps: ['description'],
      fn () {
        return DOMPurify.sanitize(this.description)
      }
    }
  },
  render () {
    View.prototype.render.apply(this, arguments)
    this.renderSubview(this.graph, this.queryByHook('graph-preview'))
  },
  remove () {
    this.graph.remove()
    View.prototype.remove.apply(this, arguments)
  }
})
