import App from 'ampersand-app'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import Help from 'language/help'
import Modalizer from 'components/modalizer'
//import TaskVersionSelectView from 'view/task-version-select'
import TaskSelectView from 'view/task-select'
import bootbox from 'bootbox'
import graphlib from 'graphlib'
import FormButtons from 'view/buttons'
import TaskForm from 'view/page/task/form'
import * as TaskConstants from 'constants/task'
import CreateTaskWizard from 'view/page/task/creation-wizard'
import ExportDialog from 'view/page/task/buttons/export/dialog'
import uuidv4 from 'uuid'
import isMongoId from 'validator/lib/isMongoId'
import TasksReviewDialog from './task-review-dialog'

const MODE_EDIT   = 'edit'
const MODE_IMPORT = 'import'

export default View.extend({
  template: `
    <div class="workflow-builder-component form-group">
      <label class="col-sm-3 control-label" data-hook="label">Tasks</label>
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

    let recipe
    let workflow = options.value

    const version = workflow.version
    if (this.mode === MODE_EDIT) {
      recipe = workflow.serialize()
    } else if (this.mode === MODE_IMPORT) {
      recipe = workflow.serialize()
      recipe.tasks = workflow.tasks.models // keep untouch
    } else {
      // will clone the tasks and replace the original ids
      recipe = workflow.serializeClone()
    }

    // migrate to version 2
    if (version !== 2) {
      recipe.graph = App.actions.workflow.migrateGraph(recipe.graph) 
      recipe.version = 2
    }

    // store:false avoid merging the state into the app.state
    this.workflow = new App.Models.Workflow.Workflow(recipe, { store: false })

    this.on('change:valid change:value', this.reportToParent, this)
  },
  props: {
    mode: 'string',
    name: ['string', false, 'workflow'],
    workflow: 'state'
  },
  derived: {
    graph: {
      cache: false,
      deps: ['workflow.graph'],
      fn () {
        return this.workflow.graph
      }
    },
    value: {
      cache: false,
      fn () {
        const { graph, tasks } = this.workflow.serialize()
        return { graph, tasks }
      }
    },
    valid: {
      deps: ['workflow.tasks','workflow.graph'],
      cache: false,
      fn () {
        const graph = this.workflow.graph
        const nodes = graph.nodes()
        // at least one node
        if ( !(nodes.length > 0) ) {
          return false
        }

        const tasks = this.workflow.getInvalidTasks()
        if (tasks.length > 0) {
          return false
        }
        return true
      }
    },
  },
  events: {
    'click [data-hook=add-task]':'onClickAddTask',
    'click [data-hook=create-task]':'onClickCreateTask'
  },
  render () {
    this.renderWithTemplate(this)
    this.renderWorkflowGraph()
  },
  renderWorkflowGraph () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(({ default: WorkflowView }) => {
        const workflowGraph = new WorkflowView({ graph: this.graph })
        this.renderSubview(workflowGraph, this.queryByHook('graph-preview'))

        const updateVisualization = () => {
          workflowGraph.updateCytoscape(this.workflow.graph)
        }

        this.on('change:graph', updateVisualization)
        this.workflow.tasks.on('change', updateVisualization)

        this.listenTo(workflowGraph, 'tap:node', this.onTapNode)
        this.listenTo(workflowGraph, 'tap:edge', this.onTapEdge)
        this.listenTo(workflowGraph, 'tap:back', this.onTapBackground)
        this.listenTo(workflowGraph, 'click:warning-indicator', this.onClickWarningIndicator)
        this.listenToAndRun(this, 'change:valid', () => {
          workflowGraph.warningToggle = !this.valid
        })

        // initial render
        setTimeout(() => {
          workflowGraph.updateCytoscape()
          workflowGraph.cy.center()
        }, 500)
      })
  },
  onClickWarningIndicator () {
    const dialog = new TasksReviewDialog({
      fade: false,
      center: true,
      workflow: this.workflow,
      buttons: false,
      title: `Tasks review`,
    })

    this.registerSubview(dialog)
    dialog.show()
    dialog.el.addEventListener('click [data-hook=edit-task]', (event) => {
      const task = event.detail.task
      editTask(task, () => {
        this.updateTaskNode(task)
      })
    })
  },
  onTapNode (event) {
    var node = event.cyTarget.data()
    if (this.contextMenu) {
      this.contextMenu.remove()
    }

    if (/Task$/.test(node.value._type) === true) {
      const id = node.value.id
      const task = this.workflow.tasks.get(id)
      if (this.connectingTask?.task !== undefined) {
        const taskOrigin = this.connectingTask.task
        this.connectingTask = undefined
        this.connectTasks(taskOrigin, task)
      } else {
        const menu = new TaskContextualMenu({ model: task })
        menu.render()
        
        menu.el.style.position = 'absolute'
        menu.el.style.top = (event.cyRenderedPosition.y + 120) + 'px'
        menu.el.style.left = event.cyRenderedPosition.x + 'px'

        this.el.appendChild(menu.el)
        this.registerSubview(menu)
        this.contextMenu = menu

        menu.on('task:copy', (task) => {
          this.addTaskNode(task)
        })
        menu.on('task:edit', (task) => {
          editTask(task, () => {
            this.updateTaskNode(task)
          })
        })
        menu.on('task:remove', () => {
          this.removeNodeDialog(node)
        })
        menu.on('task:connect', (connect) => {
          this.connectingTask = connect
        })
      }
    } else {
      this.removeNodeDialog(node)
    }
  },
  onTapEdge (event) {
    var edge = event.cyTarget.data()
    this.removeEdgeDialog(edge)
  },
  onTapBackground (event) {
    if (this.contextMenu) {
      this.contextMenu.remove()
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
        this.removeNode(node)
      }
    })
  },
  removeEdgeDialog (edge) {
    bootbox.confirm({
      title: 'Edge action',
      message: 'Delete this connection? You may create the connection again later',
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
        this.removeEdge(edge)
      }
    })
  },
  onClickAddTask (event) {
    event.preventDefault()
    event.stopPropagation()

    const taskSelection = new TaskSelectionModal()

    const modal = new Modalizer({
      fade: false,
      center: true,
      buttons: false,
      title: 'Workflow',
      bodyView: taskSelection 
    })

    modal.on('hidden',() => {
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

    const type = (node._type || node.value._type)

    for (let i=0; i<nodes.length; i++) {
      graph.removeNode(nodes[i])
    }

    this.workflow.tasks.remove(node.id)

    this.trigger('change:graph')
  },
  removeEdge (edge) {
    this.graph.removeEdge(edge.source, edge.target)

    this.trigger('change:graph')
  },
  addTaskNode (task) {
    const taskData = (task.isState?task.serialize():task)
    taskData.id = uuidv4()
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
  connectTasks (taskOrigin, taskTarget) {
    const currentEventName = this.graph.edge(taskOrigin.id, taskTarget.id) 
    const bodyView = new EventNameInputView({ currentEventName })

    const modal = new Modalizer({
      center: true,
      fade: false,
      buttons: false,
      title: 'Workflow',
      bodyView 
    })

    this.listenTo(modal, 'hidden', () => {
      bodyView.remove()
      modal.remove()
    })

    bodyView.on('submit', (eventName) => {
      const w = this.graph
      w.setEdge(taskOrigin.id, taskTarget.id, eventName)
      // force change trigger
      this.trigger('change:graph', this.graph)

      modal.hide() // hide and auto-remove
    })

    modal.show()
  },
  reportToParent () {
    if (this.parent) { this.parent.update(this) }
  }
})

const editTask = (task, done) => {
  let mode
  if (!task.script_id) {
    mode = MODE_IMPORT
  }

  const form = new TaskForm({ model: task, mode })
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
    if (isMongoId(task.id)) {
      App.actions.task.update(task.id, data)
    } else {
      task.set(data)
    }

    done(task)
    modal.hide()
  })

  modal.show()
}

const TaskSelectionModal = FormView.extend({
  initialize (options) {
    this.fields = [
      //new TaskVersionSelectView
      new TaskSelectView({
        required: true,
        label: 'Task'
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

const TaskContextualMenu = View.extend({
  template: `
    <div class="dropdown">
      <ul class="dropdown-menu" style="display: block;" data-hook="menu-buttons">
        <li><a data-hook="edit-task" href="#">Edit Task</a></li>
        <li><a data-hook="copy-task" href="#">Copy Task</a></li>
        <li><a data-hook="edit-script" href="#">Edit Script</a></li>
        <li><a data-hook="remove" href="#">Remove</a></li>
        <li><a data-hook="export" href="#">Export</a></li>
        <li><a data-hook="connect" href="#">Connect to ...</a></li>
      </ul>
    </div>
  `,
  bindings: {
    'model.id': {
      hook: 'edit-task',
      type: 'attribute',
      name: 'data-task-id'
    },
  },
  props: {
    workflow_events: 'collection'
  },
  events: {
    'click [data-hook=connect]': 'onClickConnectTasks',
    'click [data-hook=edit-task]': 'onClickEditTask',
    'click [data-hook=edit-script]': 'onClickEditScript',
    'click [data-hook=export]': 'onClickExport',
    'click [data-hook=remove]': 'onClickRemove',
    'click [data-hook=copy-task]': 'onClickCopyTask',
  },
  onClickCopyTask (event) {
    const taks = this.model
    this.trigger('task:copy', this.model)
    this.remove()
  },
  onClickEditTask (event) {
    this.trigger('task:edit', this.model)
    this.remove()
  },
  onClickEditScript (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.file.edit(this.model.script || this.model.script_id)
    this.trigger('script:edit')
    this.remove()
  },
  onClickRemove (event) {
    event.preventDefault()
    event.stopPropagation()
    this.trigger('task:remove')
    this.remove()
  },
  onClickExport (event) {
    event.preventDefault()
    event.stopPropagation()

    const dialog = new ExportDialog({ model: this.model })
    dialog.show()
    this.remove()
  },
  onClickConnectTasks (event) {
    event.preventDefault()
    event.stopPropagation()
    this.trigger('task:connect', { task: this.model })
    this.remove()
  }
})

const pointerPosition = (e) => {
  var posx = e.clientX
  var posy = e.clientY
  return { x: posx, y: posy }
}

const EventNameInputView = FormView.extend({
  props: {
    currentEventName: 'string'
  },
  bindings: {
    currentEventName: {
      hook: 'currentEventName',
      type: 'toggle',
      reverse: true
    }
  },
  initialize (options) {
    this.fields = [
      new InputView({
        label: 'Event Name',
        name: 'eventName',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        placeholder: 'use "success" to go in a single direction',
        value: 'success'
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    const buttons = new FormButtons({ confirmText: 'Confirm' })
    this.renderSubview(buttons)
    buttons.on('click:confirm', this.submit, this)

    this.renderSubview(
      new EventsMessage({ currentEventName: this.currentEventName }),
      this.query('.form-group')
    )
  },
  submit () {
    this.beforeSubmit()
    if (!this.valid) { return }
    const eventName = this.data.eventName
    if (eventName !== 'success' && eventName !== 'failure') {
      // do something?
    }

    this.trigger('submit', eventName)
  }
})

const EventsMessage = View.extend({
  props: {
    currentEventName: 'string'
  },
  template () {
    return (`
    <div>
      <section data-hook="currentEventName">
        <b>Warning</b> The current event ${this.currentEventName} will be replaced.</br>
      </section>
      <section>
        Keep in mind that the event you define must be considered in the script.</br>
        For example if the event is named "completed" an "event_name" property in the last line should be added like this
        <code class="javascript">
        {"state":"success","event_name":"completed","data":[...]}
        </code>
      </section>
    </div>
  `)
  }
})
