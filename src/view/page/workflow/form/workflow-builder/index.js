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
//import WorkflowView from 'view/workflow'

const graphlib = require('graphlib')

module.exports = View.extend({
  props: {
    name: ['string',false,'workflow'],
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
      <div class="workflow-preview col-sm-12" data-hook="graph-preview" style="height: 200px;"></div>
    </div>
  `,
  initialize (options) {
    this.graph = options.value || new graphlib.Graph({
      directed: true,
      multigraph: false,
      compound: false
    })

    View.prototype.initialize.apply(this,arguments)
    this.on('change:valid change:value', this.reportToParent, this)
  },
  events: {
    'click [data-hook=build]':'onClickAddEvent',
  },
  render () {
    this.renderWithTemplate(this)
    this.renderWorkflowPreview()
  },
  renderWorkflowPreview () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(WorkflowView => {
        const workflowPreview = new WorkflowView({
          graph: this.graph
        })

        this.workflowPreview = workflowPreview

        this.renderSubview(workflowPreview, this.queryByHook('graph-preview'))

        this.on('change:graph', workflowPreview.updateCytoscape, workflowPreview)
      })
  },
  onClickAddEvent (event) {
    event.preventDefault()
    event.stopPropagation()

    const builder = new WorkflowBuilderView({
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
  initialize (options) {
    let emitterSelection
    let stateEventSelection
    let taskSelection

    let emitter_id = options.emitter && options.emitter.id
    if (emitter_id) {
      emitterSelection = new CustomDisabledInputView({
        name: 'emitter',
        value: options.emitter.summary,
        label: 'Event emitter',
        selectedValue: options.emitter
      })
    } else {
      emitterSelection = new TaskSelectView({
        label: 'Task A',
        name: 'emitter',
        filterOptions: [
          item => !item.workflow_id
        ]
      })
      emitterSelection.on('change:value', () => {
        let emitter = emitterSelection.selected()
        if (!emitter) return
        let options = App.state.events.filterEmitterEvents(emitter)
        stateEventSelection.options = options
        if (options.length>0) {
          stateEventSelection.setValue(options[0])
        }
      })
    }

    stateEventSelection = new SelectView({
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
      stateEventSelection.options = events.filterEmitterEvents(options.emitter)
    }

    taskSelection = new TaskSelectView({
      label: 'Task B',
      filterOptions: [
        item => !item.workflow_id
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
    buttons.on('click:confirm', () => {
      this.trigger('event-added', this.prepareData())
    })
  },
  prepareData () {
    return {
      emitter: this._fieldViews.emitter.selected(),
      emitter_state: this._fieldViews.emitter_state.selected(),
      task: this._fieldViews.task.selected(),
    }
  }
})
