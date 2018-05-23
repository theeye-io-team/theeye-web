import App from 'ampersand-app'
import View from 'ampersand-view'
import Collection from 'ampersand-collection'
import FormView from 'ampersand-form-view'
const HelpTexts = require('language/help')
import Modalizer from 'components/modalizer'
import SelectView from 'components/select2-view'
import TaskSelectView from 'view/task-select'
import FormButtons from 'view/buttons'
import DisabledInputView from 'components/input-view/disabled'
import bootbox from 'bootbox'

const graphlib = require('graphlib')

module.exports = View.extend({
  props: {
    workflow_id: 'string',
    name: ['string', false, 'workflow'],
    // the first selected task. this is the first task executed.
    startTask: 'state',
    // the last selected task. can be empty.
    // will be used as emitter on next selection step
    endTask: 'state',
    graph: ['object', false]
  },
  derived: {
    value: {
      cache: false,
      deps: ['graph'],
      fn () {
        //return graphlib.json.write(this.graph)
        return this.graph
      }
    },
    valid: {
      cache: false,
      deps: ['graph'],
      fn () {
        let nodes = this.graph.nodes()
        let edges = this.graph.edges()
        return nodes.length > 0 && edges.length > 0
      }
    },
    workflowTasksCollection: {
      //cache: false,
      deps: ['graph'],
      fn () {
        let nodes = this.graph.nodes()
        var tasks = []
        nodes.forEach(id => {
          var node = this.graph.node(id)
          if (node && !/Event/.test(node._type)) {
            let task = App.state.tasks.get(id)
            if (!task) return
            tasks.push(task)
          }
        })
        return new Collection(tasks)
      }
    },
    workflowEventsCollection: {
      //cache: false,
      deps: ['graph'],
      fn () {
        let nodes = this.graph.nodes()
        var events = []
        nodes.forEach(id => {
          var node = this.graph.node(id)
          if (/Event/.test(node._type)) {
            events.push({ id })
          }
        })
        return new Collection(events)
      }
    }
  },
  template: `
	  <div class="workflow-builder-component form-group">
      <label class="col-sm-3 control-label" data-hook="label"> Workflow Events </label>
      <div class="col-sm-9">
        <div style="padding-bottom: 15px;">
          <button data-hook="build" title="build the workflow" class="btn btn-default">
            Add event <i class="fa fa-wrench"></i>
          </button>
        </div>
      </div>
      <div class="workflow-preview col-sm-12" data-hook="graph-preview" style="height: 300px;"></div>
    </div>
  `,
  initialize (options) {
    if (options.value) {
      //clone to new graph
      this.graph = graphlib.json.read(graphlib.json.write(options.value))
    } else {
      this.graph = new graphlib.Graph({
        directed: true,
        multigraph: false,
        compound: false
      })
    }

    View.prototype.initialize.apply(this,arguments)
    this.on('change:valid change:value', this.reportToParent, this)
  },
  events: {
    'click [data-hook=build]':'onClickAddEvent',
  },
  render () {
    this.renderWithTemplate(this)
    this.renderWorkflowGraph()
  },
  renderWorkflowGraph () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(WorkflowView => {
        const workflowGraph = new WorkflowView({
          graph: this.graph,
          mode: 'edit'
        })
        this.workflowGraph = workflowGraph
        this.renderSubview(workflowGraph, this.queryByHook('graph-preview'))
        this.on('change:graph', workflowGraph.updateCytoscape, workflowGraph)
        this.listenTo(workflowGraph, 'tap:node', this.onTapNode)
        this.listenTo(workflowGraph, 'reset', this.onResetButton)
      })
  },
  onResetButton () {
		bootbox.confirm({
			title: 'Workflow action',
			message: 'Remove all nodes?',
			buttons: {
				confirm: {
					label: 'Yes, please',
					className: 'btn-danger'
				},
				cancel: {
					label: 'Cancel',
					className: 'btn-default'
				},
			},
			callback: confirm => {
				if (!confirm) { return }
        this.reset()
			}
		})
  },
  reset () {
    var graph = this.graph
    this.startTask = null
    this.endTask = null
    graph.nodes().forEach(node => graph.removeNode(node))
    this.trigger('change:graph', graph)
  },
  onTapNode (event) {
    var node = event.cyTarget.data()

		bootbox.confirm({
			title: 'Node action',
			message: 'Delete the node? its successors will be deleted too.',
			buttons: {
				confirm: {
					label: 'Yes, please',
					className: 'btn-danger'
				},
				cancel: {
					label: 'Better keep it',
					className: 'btn-default'
				},
			},
			callback: confirm => {
				if (!confirm) { return }
        this.removeNode(node.id)
			}
		})
  },
  removeNode (node) {
    const graph = this.graph
    var node = graph.node(node)
    var nodes = []
    collectSuccessorsInPath(nodes, node.id, graph)

    // we should replace the end task
    if (!/Event/.test(node._type)) { // also remove the predecessor event node of the task
      var evNodes = graph.predecessors(node.id)
      if (evNodes.length>0) {
        nodes.push(evNodes[0])
        let endTask = graph.predecessors(evNodes[0])[0]
        this.set('endTask', App.state.tasks.get(endTask))
      } else {
        // start task removed
        this.unset('startTask')
        this.unset('endTask')
      }
    } else { // event removed, predecessor is the last task
      let endTask = graph.predecessors(node.id)[0]
      this.set('endTask', App.state.tasks.get(endTask))
    }

    for (var i=0; i<nodes.length; i++) {
      graph.removeNode(nodes[i])
    }

    this.trigger('change:graph', this.graph)
  },
  onClickAddEvent (event) {
    event.preventDefault()
    event.stopPropagation()

    const builder = new WorkflowBuilderView({
      workflow_tasks: this.workflowTasksCollection,
      workflow_events: this.workflowEventsCollection,
      workflow_id: this.workflow_id,
      label: 'Event',
      name: 'event',
      emitter: this.endTask
    })

    const modal = new Modalizer({
      buttons: false,
      title: 'Workflow',
      bodyView: builder 
    })

    this.listenTo(modal,'hidden',() => {
      builder.remove()
      modal.remove()
    })

    builder.on('event-added', (eventData) => {
      this.onEventAdded(eventData)
      modal.hide() // hide and auto-remove
    })

    modal.show()

    return false
  },
  onEventAdded (data) {
    const w = this.graph
    w.setNode(data.emitter.id, data.emitter)
    w.setNode(data.emitter_state.id, data.emitter_state)
    w.setNode(data.task.id, data.task)

    w.setEdge(data.emitter.id, data.emitter_state.id)
    w.setEdge(data.emitter_state.id, data.task.id)

    if (!this.endTask) {
      this.startTask = data.emitter
    }
    this.endTask = data.task
    // force change trigger
    this.trigger('change:graph', this.graph)
  },
  reportToParent () {
    if (this.parent) this.parent.update(this)
  }
})

const CustomDisabledInputView = DisabledInputView.extend({
  props: {
    selectedValue: 'any'
  },
  selected () {
    return this.selectedValue
  }
})

const WorkflowBuilderView = FormView.extend({
  props: {
    workflow_tasks: 'collection',
    workflow_events: 'collection',
    workflow_id: 'string',
    nodes: ['array', false, () => { return [] }]
  },
  initialize (options) {
    let emitterSelection
    let stateEventSelection
    let taskSelection

    let emitter_id = options.emitter && options.emitter.id
    if (emitter_id) {
      emitterSelection = new TaskSelectView({
        required: true,
        label: 'Task A',
        name: 'emitter',
        options: this.workflow_tasks
      })
    } else {
      emitterSelection = new TaskSelectView({
        required: true,
        label: 'Task A',
        name: 'emitter',
        filterOptions: [
          item => {
            let filter = !item.workflow_id || (item.workflow_id === this.workflow_id)
            return filter
          }
        ]
      })
    }

    emitterSelection.on('change:value', () => {
      let emitter = emitterSelection.selected()
      if (!emitter) return
      let options = App.state.events.filterEmitterEvents(
        emitter,
        this.workflow_events
      )
      stateEventSelection.options = options
      if (options.length>0) {
        stateEventSelection.setValue(options[0])
      }
    })

    stateEventSelection = new SelectView({
      required: true,
      label: 'State',
      name: 'emitter_state',
      options: new Collection([]),
      multiple: false,
      tags: false,
      idAttribute: 'id',
      textAttribute: 'name',
      unselectedText: 'select the emitter state'
    })

    if (emitter_id) {
      let events = App.state.events
      stateEventSelection.options = events.filterEmitterEvents(
        options.emitter,
        this.workflow_events
      )
    }

    taskSelection = new TaskSelectView({
      required: true,
      label: 'Task B',
      filterOptions: [
        item => {
          let filter = !item.workflow_id || (item.workflow_id === this.workflow_id)
          return filter
        }
      ]
    })

    this.fields = [
      emitterSelection,
      stateEventSelection,
      taskSelection
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    const buttons = new FormButtons({ confirmText: 'Add' })
    this.renderSubview(buttons)
    buttons.on('click:confirm', this.submit, this)
  },
  submit () {
    this.beforeSubmit()
    if (!this.valid) {
      // cancel submit
      return
    }
    let data = this.prepareData(this.data)
    this.trigger('event-added', data)
  },
  prepareData () {
    return {
      emitter: this._fieldViews.emitter.selected(),
      emitter_state: this._fieldViews.emitter_state.selected(),
      task: this._fieldViews.task.selected(),
    }
  }
})

const collectSuccessorsInPath = (successors, node, graph) => {
  successors.push(node)
  var nodes = graph.successors(node)
  if (nodes.length===0) return
  for (var i=0; i<nodes.length; i++) {
    collectSuccessorsInPath(successors, nodes[i], graph)
  }
}
