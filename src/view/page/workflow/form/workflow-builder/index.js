import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import HelpTexts from 'language/help'
import Modalizer from 'components/modalizer'
import SelectView from 'components/select2-view'
import TaskSelectView from 'view/task-select'
import bootbox from 'bootbox'
import graphlib from 'graphlib'
import FormButtons from 'view/buttons'
import CopyTaskButton from 'view/page/task/buttons/copy'
import TaskForm from 'view/page/task/form'
import CreateTaskWizard from 'view/page/task/creation-wizard'
import ExportDialog from 'view/page/task/buttons/export/dialog'
import uuidv4 from 'uuid'

export default View.extend({
  template: `
    <div class="workflow-builder-component form-group">
      <label class="col-sm-3 control-label" data-hook="label"> Workflow Events </label>
      <div class="col-sm-9">
        <div style="padding-bottom: 15px;" data-hook="buttons">
          <button data-hook="add-task" title="Existent Task" class="btn btn-default">
            Add Existent Task <i class="fa fa-wrench"></i>
          </button>
          <button data-hook="create-task" title="Create Task" class="btn btn-default">
            Add New Task <i class="fa fa-plus-circle"></i>
          </button>
        </div>
      </div>
      <div class="workflow-preview col-sm-12" data-hook="graph-preview"></div>
    </div>
  `,
  initialize (options) {
    View.prototype.initialize.apply(this,arguments)

		const recipe = App.actions.workflow.createRecipe(options.value, {})
		// store:false avoid merging the state into the app.state
		const workflow = new App.Models.Workflow.Workflow(recipe, {store: false})

    this.workflow = workflow

    //if (options.value) {
    //  //clone to new graph
    //  this.graph = graphlib.json.read(graphlib.json.write(options.value))
    //} else {
    //  this.graph = new graphlib.Graph({
    //    directed: true,
    //    multigraph: false,
    //    compound: false
    //  })
    //}

    //this.workflowTasks = new App.Models.Task.Collection(options.tasksModels)
    //this.workflowEvents = new App.Models.Event.Collection(options.eventsModels)

    this.on('change:valid change:value', this.reportToParent, this)
  },
  props: {
    create: ['boolean', false, false ],
    name: ['string', false, 'workflow'],
    workflow: 'state',
    //graph: 'object',
    //workflowTasks: 'collection',
    //workflowEvents: 'collection'
  },
  derived: {
    graph: {
      cache: false,
      deps: ['workflow'],
      fn () {
        return this.workflow.graph
      }
    },
    //workflowTasks: {
    //  cache: false,
    //  deps: ['workflow'],
    //  fn () {
    //    return this.workflow.tasks
    //  }
    //},
    //workflowEvents: {
    //  cache: false,
    //  deps: ['workflow'],
    //  fn () {
    //    return this.workflow.events
    //  }
    //},
    value: {
      cache: false,
      deps: ['workflow'],
      fn () {
        return this.workflow
      }
    },
    valid: {
      cache: false,
      deps: ['workflow'],
      fn () {
        const graph = this.workflow.graph
        let nodes = graph.nodes()
        let edges = graph.edges()
        return (nodes.length > 0 && edges.length > 0)
      }
    },
    //graphTasks: {
    //  //cache: false,
    //  deps: ['graph'],
    //  fn () {
    //    let nodes = this.graph.nodes()
    //    var tasks = []
    //    nodes.forEach(id => {
    //      var node = this.graph.node(id)
    //      if (node && !/Event/.test(node._type)) {
    //        let task = this.currentTasks.get(id)
    //        if (!task) { return }
    //        tasks.push(task)
    //      }
    //    })
    //    return new Collection(tasks)
    //  }
    //},
    //graphEvents: {
    //  //cache: false,
    //  deps: ['graph'],
    //  fn () {
    //    let nodes = this.graph.nodes()
    //    var events = []
    //    nodes.forEach(id => {
    //      var node = this.graph.node(id)
    //      if (/Event/.test(node._type)) {
    //        events.push({ id })
    //      }
    //    })
    //    return new Collection(events)
    //  }
    //}
  },
  events: {
    'click [data-hook=add-task]':'onClickAddTask',
    'click [data-hook=create-task]':'onClickCreateTask',
  },
  render () {
    this.renderWithTemplate(this)
    this.renderWorkflowGraph()
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

        const updateGraph = () => {
          workflowGraph.updateCytoscape(this.workflow.graph)
        }

        this.on('change:graph', updateGraph)
        this.workflow.tasks.on('change', updateGraph)

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
    this.trigger('change:graph')
  },
  onTapNode (event) {
    var node = event.cyTarget.data()
    if (this.contextMenu) {
      this.contextMenu.remove()
    }

    if (/Task$/.test(node.value._type) === true) {
      var task = App.state.tasks.get(node.id)

      if (this.taskSelected === true) {
        this.connectTask['task'] = task
        this.taskSelected = false
        this.onEventAdded(this.connectTask)
      } else {
        var menu = new ContextualMenu({
          model: task,
          workflow_events: this.workflowEventsCollection
        })
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

        menu.on('click:remove', () => { this.removeNodeDialog(node) })

        menu.on('click:connect', (action) => {
          this.connectTask = {
            emitter: task,
            emitter_state: action
          }
          this.taskSelected = true
        })
      }
    } else {
      this.removeNodeDialog(node)
    }
  },
  editTask (task) {
    const form = new TaskForm({ model: task })
    const modal = new Modalizer({
      buttons: false,
      title: `Edit task ${task.name} [${task.id}]`,
      bodyView: form
    })

    modal.on('hidden', () => {
      form.remove()
      modal.remove()
    })

    form.on('submit', data => {
      if (task.persisted === true) {
        App.actions.task.update(task.id, data)
      } else {
        task.set(data)
      }
      this.updateTaskNode(task)
      modal.hide()
    })

    modal.show()
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
        this.removeNode(node)
      }
    })
  },
  onClickAddTask (event) {
    event.preventDefault()
    event.stopPropagation()

    const taskSelection = new TaskSelectionModal({ tasks: App.state.tasks })

    const modal = new Modalizer({
      buttons: false,
      title: 'Workflow',
      bodyView: taskSelection 
    })

    this.listenTo(modal,'hidden',() => {
      taskSelection.remove()
      modal.remove()
    })

    taskSelection.on('submit', (task) => {
      this.addTaskNode(task)
      modal.hide() // hide and auto-remove
    })

    modal.show()
    return false
  },
  onClickCreateTask (event) {
    event.preventDefault()
    event.stopPropagation()

    const wizard = new CreateTaskWizard({
      submit: taskData => {
        this.addTaskNode(taskData)
      }
    })

    return false
  },
  removeNode (node) {
    const id = node.id
    const graph = this.graph
    const nodes = [ id ]

    // also remove the predecessor and successors event nodes of the task
    if (!/Event/.test(node._type)) {
      graph.predecessors(id).forEach(n => nodes.push(n))
      graph.successors(id).forEach(n => nodes.push(n))
    }

    for (let i=0; i<nodes.length; i++) {
      graph.removeNode(nodes[i])
    }

    this.workflow.tasks.remove(node.id)

    this.trigger('change:graph')
  },
  addTaskNode (task) {

    const taskData = (task.isState?task.serialize():task)
    taskData.id = uuidv4()
    //taskData.persisted = false
    const clone = new App.Models.Task.Factory(taskData, { store: false }) 

    this.workflow.tasks.add(clone)

    const w = this.graph
    w.setNode(clone.id, clone)

    // force change trigger to redraw
    this.trigger('change:graph')
  },
  updateTaskNode (task) {
    const w = this.graph
    w.setNode(task.id, task)
    // force change trigger to redraw
    this.trigger('change:graph')
  },
  reportToParent () {
    if (this.parent) { this.parent.update(this) }
  }
})

const TaskSelectionModal = FormView.extend({
  props: {
    tasks: 'collection',
  },
  initialize (options) {
    this.fields = [
      new TaskSelectView({
        required: true,
        label: 'Task',
        options: this.tasks
      })
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
    if (!this.valid) { return }
    let task = this.prepareData()
    this.trigger('submit', task)
  },
  prepareData () {
    return this._fieldViews.task.selected()
  }
})

//const WorkflowEventsSelection = FormView.extend({
//  props: {
//    currentTasks: 'collection',
//    currentEvents: 'collection',
//    workflow_id: 'string',
//    nodes: ['array', false, () => { return [] }]
//  },
//  initialize (options) {
//    let emitterSelection
//    let stateEventSelection
//    let taskSelection
//
//    if (this.currentTasks && this.currentTasks.length > 0) {
//      emitterSelection = new TaskSelectView({
//        required: true,
//        label: 'Task A',
//        name: 'emitter',
//        options: this.currentTasks
//      })
//    } else {
//      emitterSelection = new TaskSelectView({
//        required: true,
//        label: 'Task A',
//        name: 'emitter',
//        filterOptions: [
//          item => {
//            let filter = !item.workflow_id || (item.workflow_id === this.workflow_id)
//            return filter
//          }
//        ]
//      })
//    }
//
//    emitterSelection.on('change:value', () => {
//      let emitter = emitterSelection.selected()
//      if (!emitter) { return }
//      let options = App.state.events.filterEmitterEvents(
//        emitter,
//        this.currentEvents
//      )
//      stateEventSelection.options = options
//      if (options.length>0) {
//        stateEventSelection.setValue(options[0])
//      }
//    })
//
//    stateEventSelection = new SelectView({
//      required: true,
//      label: 'State',
//      name: 'emitter_state',
//      options: new Collection([]),
//      multiple: false,
//      tags: false,
//      idAttribute: 'id',
//      textAttribute: 'name',
//      unselectedText: 'select the emitter state'
//    })
//
//    taskSelection = new TaskSelectView({
//      required: true,
//      label: 'Task B',
//      filterOptions: [
//        item => {
//          let filter = !item.workflow_id || (item.workflow_id === this.workflow_id)
//          return filter
//        }
//      ]
//    })
//
//    this.fields = [
//      emitterSelection,
//      stateEventSelection,
//      taskSelection
//    ]
//
//    FormView.prototype.initialize.apply(this, arguments)
//  },
//  render () {
//    FormView.prototype.render.apply(this, arguments)
//    this.query('form').classList.add('form-horizontal')
//
//    const buttons = new FormButtons({ confirmText: 'Add' })
//    this.renderSubview(buttons)
//    buttons.on('click:confirm', this.submit, this)
//  },
//  submit () {
//    this.beforeSubmit()
//    if (!this.valid) {
//      // cancel submit
//      return
//    }
//    let data = this.prepareData(this.data)
//    this.trigger('submit', data)
//  },
//  prepareData () {
//    return {
//      emitter: this._fieldViews.emitter.selected(),
//      emitter_state: this._fieldViews.emitter_state.selected(),
//      task: this._fieldViews.task.selected(),
//    }
//  }
//})

const ContextualMenu = View.extend({
  template: `
    <div class="dropdown">
      <ul class="dropdown-menu" style="display: block;" data-hook="menu-buttons">
        <li><a data-hook="success" href="#">On Success</a></li>
        <li><a data-hook="failure" href="#">On Failure</a></li>
        <li><a data-hook="edit" href="#">Edit Task</a></li>
        <li><a data-hook="edit-script" href="#">Edit Script</a></li>
        <li><a data-hook="remove" href="#">Remove</a></li>
        <li><a data-hook="export" href="#">Export</a></li>
      </ul>
    </div>
  `,
  props: {
    workflow_events: 'collection'
  },
  render () {
    this.renderWithTemplate(this)

    this.events = App.state.events.filterEmitterEvents(
      this.model,
      this.workflow_events
    )

    const copyButton = new CopyTaskButton({ model: this.model, elem: 'a' })
    this.renderSubview(copyButton, this.queryByHook("menu-buttons"))
  },
  events: {
    'click [data-hook=success]': 'onConnectTasks',
    'click [data-hook=failure]': 'onConnectTasks',
    'click [data-hook=edit]': 'onClickEdit',
    'click [data-hook=edit-script]': 'onClickEditScript',
    'click [data-hook=export]': 'onClickExport',
    'click [data-hook=remove]': 'onClickRemove'
  },
  onClickEdit (event) {
    event.preventDefault()
    event.stopPropagation()
    this.trigger('edit')
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
    this.remove()
  },
  onConnectTasks (event) {
    event.preventDefault()
    event.stopPropagation()
    const action = this.events.filter(e => e.name == event.target.dataset.hook)[0]
    this.trigger('click:connect', action)
    this.remove()
  }
})

const pointerPosition = (e) => {
  var posx = e.clientX
  var posy = e.clientY
  return { x: posx, y: posy }
}

//const getTask = (id, tasks) => {
//  if (tasks && tasks.length > 0) {
//    return tasks.get(id)
//  } else {
//    return App.state.tasks.get(id)
//  }
//}
