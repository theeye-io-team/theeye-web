import App from 'ampersand-app'
import View from 'ampersand-view'
import Collection from 'ampersand-collection'
import FormView from 'ampersand-form-view'
import HelpTexts from 'language/help'
import Modalizer from 'components/modalizer'
import SelectView from 'components/select2-view'
import TaskSelectView from 'view/task-select'
import DisabledInputView from 'components/input-view/disabled'
import bootbox from 'bootbox'
import graphlib from 'graphlib'
import isMongoId from 'validator/lib/isMongoId'
import FormButtons from 'view/buttons'
import CopyTaskButton from 'view/page/task/buttons/copy'
import CreateTaskButton from 'view/page/task/buttons/create'
import EditModalizer from 'view/page/task/edit-modalizer'

import ExportDialog from 'view/page/task/buttons/export/dialog'

export default View.extend({
  props: {
    workflow_id: 'string',
    name: ['string', false, 'workflow'],
    graph: ['object', false],
    task_list: ['array', false]
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
        <div style="padding-bottom: 15px;" data-hook="buttons">
          <button data-hook="build" title="build the workflow" class="btn btn-default">
            Add event <i class="fa fa-wrench"></i>
          </button>
        </div>
      </div>
      <div class="workflow-preview col-sm-12" data-hook="graph-preview"></div>
    </div>
  `,
  initialize (options) {
    console.log(graphlib.json.write(options.value))
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
    'click [data-hook=build]':'onClickAddEvent'
  },
  render () {
    this.renderWithTemplate(this)
    this.renderWorkflowGraph()

    const button = new CreateTaskButton()
    this.renderSubview(button, this.queryByHook('buttons'))
  },
  renderWorkflowGraph () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(({ default: WorkflowView }) => {
        const workflowGraph = new WorkflowView({
          graph: this.graph,
          mode: 'edit'
        })
        this.workflowGraph = workflowGraph
        this.renderSubview(workflowGraph, this.queryByHook('graph-preview'))

        setTimeout(() => {
          this.workflowGraph.updateCytoscape()
        }, 1000)

        this.on('change:graph', workflowGraph.updateCytoscape, workflowGraph)
        this.listenTo(workflowGraph, 'tap:node', this.onTapNode)
        this.listenTo(workflowGraph, 'clear', this.onClearButton)
      })
  },
  onClearButton () {
    bootbox.confirm({
      title: 'Workflow action',
      message: 'Remove everything?',
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
        this.clear()
      }
    })
  },
  clear () {
    var graph = this.graph
    graph.nodes().forEach(node => graph.removeNode(node))
    this.trigger('change:graph', graph)
  },
  onTapNode (event) {
    var self = this
    var node = event.cyTarget.data()
    debugger
    if (this.contextMenu) {
      this.contextMenu.remove()
    }

    if (/Task$/.test(node.value._type) === true) {
      if (this.task_list) {
        var task = this.task_list.filter(task => task.id === node.id)[0]
      } else {
        var task = App.state.tasks.get(node.id)
      }
      var menu = new Menu({ model: task })
      menu.render()
      menu.el.style.position = 'absolute'
      menu.el.style.top = (event.cyRenderedPosition.y + 120) + 'px'
      menu.el.style.left = event.cyRenderedPosition.x + 'px'

      this.el.appendChild(menu.el)
      this.registerSubview(menu)
      this.contextMenu = menu

      // this is a task node
      menu.on('click:edit', () => {
        self.stopListening(task, 'change:name')
        self.listenTo(task, 'change:name', function() {
          self.trigger('change:graph', self.graph)
        })
      })

      menu.on('click:remove', () => {
        this.removeNodeDialog(node)
      })
    } else {
      this.removeNodeDialog(node)
    }
  },
  removeNodeDialog (node) {
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
  removeNode (id) {
    const graph = this.graph
    var nodes = [id]
    var node = graph.node(id)

    // also remove the predecessor and successors event nodes of the task
    if (!/Event/.test(node._type)) {
      graph.predecessors(id).forEach(n => nodes.push(n))
      graph.successors(id).forEach(n => nodes.push(n))
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
      name: 'event'
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
  onClickCreateTask () {
  },
  onEventAdded (data) {
    const w = this.graph
    w.setNode(data.emitter.id, data.emitter)
    w.setNode(data.emitter_state.id, data.emitter_state)
    w.setNode(data.task.id, data.task)

    w.setEdge(data.emitter.id, data.emitter_state.id)
    w.setEdge(data.emitter_state.id, data.task.id)

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

    if (this.workflow_tasks.length>0) {
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

const Menu = View.extend({
  template: `
    <div class="dropdown">
      <ul class="dropdown-menu" style="display: block;" data-hook="menu-buttons">
        <li><a data-hook="edit" href="#">Edit Task</a></li>
        <li><a data-hook="edit-script" href="#">Edit Script</a></li>
        <li><a data-hook="remove" href="#">Remove</a></li>
        <li><a data-hook="export" href="#">Export</a></li>
      </ul>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)
    debugger
    const copyButton = new CopyTaskButton({ model: this.model, elem: 'a' })
    this.renderSubview(copyButton, this.queryByHook("menu-buttons"))
  },
  events: {
    'click [data-hook=edit]': 'onClickEdit',
    'click [data-hook=copy]': 'onClickCopy',
    'click [data-hook=edit-script]': 'onClickEditScript',
    'click [data-hook=export]': 'onClickExport',
    'click [data-hook=remove]': 'onClickRemove'
  },
  onClickEdit (event) {
    event.preventDefault()
    event.stopPropagation()
    if (isMongoId(this.model.id)) {
      App.actions.task.edit(this.model.id)
    } else {
      const editView = new EditModalizer({
        model: this.model
      })
      editView.show()
    }
    this.trigger('click:edit')
    this.remove()
  },
  onClickCopy (event) {
    event.preventDefault()
    event.stopPropagation()
    if (isMongoId(this.model.id)) {
      App.actions.task.edit(this.model.id)
    } else {
      const editView = new EditModalizer({
        model: this.model
      })
      editView.show()
    }
    this.trigger('click:edit')
    this.remove()
  },
  onClickEditScript (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.file.edit(this.model.script_id)
    this.trigger('click:edit')
    this.remove()
  },
  onClickRemove (event) {
    event.preventDefault()
    event.stopPropagation()
    this.trigger('click:remove')
    this.remove()
  },
  onClickExport (event) {
    event.preventDefault()
    event.stopPropagation()

    const dialog = new ExportDialog({ model: this.model })
    dialog.show()

    //App.actions.task.exportRecipe(this.model.id)
    this.remove()
  },
})

const pointerPosition = (e) => {
  var posx = e.clientX
  var posy = e.clientY
  return { x: posx, y: posy }
}
