import App from 'ampersand-app'
import View from 'ampersand-view'
import Collection from 'ampersand-collection'
import FormView from 'ampersand-form-view'
import Help from 'language/help'
import Modalizer from 'components/modalizer'
import SelectView from 'components/select2-view'
//import TaskVersionSelectView from 'view/task-version-select'
import TaskSelectView from 'view/task-select'
import bootbox from 'bootbox'
import graphlib from 'graphlib'
import FormButtons from 'view/buttons'
import CopyTaskButton from 'view/page/task/buttons/copy'
import TaskForm from 'view/page/task/form'
import * as TaskConstants from 'constants/task'
import CreateTaskWizard from 'view/page/task/creation-wizard'
import ExportDialog from 'view/page/task/buttons/export/dialog'
import uuidv4 from 'uuid'
import './styles.less'

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
    if (this.mode === 'edit') {
      recipe = workflow.serialize()
    } else if (this.mode === 'import') {
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
    'click [data-hook=create-task]':'onClickCreateTask',
    'click [data-hook=edit-task]':'onClickEditTask',
  },
  onClickEditTask (event) {
    event.preventDefault()
    event.stopPropagation()
    
    const eventData = event.delegateTarget.dataset

    const task = this.workflow.tasks.get(eventData.taskId)
    editTask(task, this.mode, () => {
      this.updateTaskNode(task)
    })

    return false
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
      workflow: this.workflow,
      buttons: false,
      title: `Tasks review`,
      appendToParent: true
    })

    this.registerSubview(dialog)

    dialog.on('hidden', () => {
      dialog.remove()
    })

    dialog.show()

  },
  onTapNode (event) {
    var node = event.cyTarget.data()
    if (this.contextMenu) {
      this.contextMenu.remove()
    }

    if (/Task$/.test(node.value._type) === true) {
      const id = node.value.id
      const task = this.workflow.tasks.get(id)
      if (this.connectingTask !== undefined) {
        const taskOrigin = this.connectingTask.task
        const eventName = this.connectingTask.eventName

        this.connectingTask = undefined

        this.connectTasks(taskOrigin, task, eventName)
      } else {
        const menu = new TaskContextualMenu({ model: task })
        menu.render()
        
        menu.el.style.position = 'absolute'
        menu.el.style.top = (event.cyRenderedPosition.y + 120) + 'px'
        menu.el.style.left = event.cyRenderedPosition.x + 'px'

        this.el.appendChild(menu.el)
        this.registerSubview(menu)
        this.contextMenu = menu

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
    taskData.synchronized = false
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
  connectTasks (taskOrigin, taskTarget, eventName) {
    const w = this.graph
    //w.setNode(data.emitter.id, data.emitter)
    //w.setNode(data.emitter_state.id, data.emitter_state)
    //w.setNode(data.task.id, data.task)
    //w.setEdge(data.emitter.id, data.emitter_state.id)
    //w.setEdge(data.emitter_state.id, data.task.id)

    w.setEdge(taskOrigin.id, taskTarget.id, eventName)

    // force change trigger
    this.trigger('change:graph', this.graph)
  },
  reportToParent () {
    if (this.parent) { this.parent.update(this) }
  }
})

const editTask = (task, mode, done) => {
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
    if (task.synchronized === true) {
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
        <li><a data-hook="edit-script" href="#">Edit Script</a></li>
        <li><a data-hook="remove" href="#">Remove</a></li>
        <li><a data-hook="export" href="#">Export</a></li>
        <li><a data-hook="success" href="#">On Success</a></li>
        <li><a data-hook="failure" href="#">On Failure</a></li>
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
  render () {
    this.renderWithTemplate(this)

    const copyButton = new CopyTaskButton({ model: this.model, elem: 'a' })
    this.renderSubview(copyButton, this.queryByHook("menu-buttons"))
  },
  events: {
    'click [data-hook=success]': 'onClickConnectTasks',
    'click [data-hook=failure]': 'onClickConnectTasks',
    'click [data-hook=edit-task]': 'onClickEdit',
    'click [data-hook=edit-script]': 'onClickEditScript',
    'click [data-hook=export]': 'onClickExport',
    'click [data-hook=remove]': 'onClickRemove'
  },
  onClickEdit (event) {
    //this.trigger('task:edit')
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
    const eventName = event.target.dataset.hook
    this.trigger('task:connect', { task: this.model, eventName })
    this.remove()
  }
})

const pointerPosition = (e) => {
  var posx = e.clientX
  var posy = e.clientY
  return { x: posx, y: posy }
}

const TasksReviewDialog = Modalizer.extend({
  autoRender: false,
  props: {
    workflow: 'state',
    autohost: 'boolean'
  },
  bindings: {
    autohost: {
      hook: 'autohost',
      type: 'toggle'
    }
  },
  initialize () {
    this.buttons = false // disable build-in modal buttons
    Modalizer.prototype.initialize.apply(this, arguments)
    this.on('hidden', () => { this.remove() })

    if (App.state.hosts.length === 1) {
      this.listenToAndRun(this.workflow, 'change:tasks', () => {
        this.updateState()
      })
    }
  },
  updateState () {
    this.autohost = this.workflow
      .getInvalidTasks()
      .models
      .map(t => t.missingConfiguration)
      .filter(c => {
        return (c.find(p => p.label === 'Host') !== undefined)
      })
      .length > 0
  },
  template () {
    return `
    <div data-component="invalid-tasks-dialog" class="modalizer">
      <!-- MODALIZER CONTAINER -->
      <div data-hook="modalizer-class" class="">
        <div class="modal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="modal"
          aria-hidden="true"
          style="display:none;">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" data-hook="close-${this.cid}" class="close" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title">
                  Review the following tasks
                </h4>
              </div>
              <div class="modal-body" data-hook="body">
                <section data-hook="actions-container">
                  <button class="autocomplete" data-hook="autohost">
                    <i class="fa fa-server"></i> Autocomplete Host
                  </button>
                </section>
                <h1></h1>
                <ul class="tasks-list" data-hook="tasks-container"></ul>
              </div>
            </div><!-- /MODAL-CONTENT -->
          </div><!-- /MODAL-DIALOG -->
        </div><!-- /MODAL -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `
  },
  events: Object.assign({}, Modalizer.prototype.events, {
    'click [data-hook=autohost]': function (event) {
      event.preventDefault()
      event.stopPropagation()

      if ( App.state.hosts.length !== 1 ) { return }

      const tasksCollection = this.workflow.getInvalidTasks()

      for (let task of tasksCollection.models) {
        for (let cfg of task.missingConfiguration) {
          if (/host/i.test(cfg.label)) {
            const host = App.state.hosts.models[0]
            task.host_id = host.id
          }
        }
      }
    }
  }),
  render () {
    Modalizer.prototype.render.apply(this, arguments)

    const tasksCollection = this.workflow.getInvalidTasks()

    this.renderCollection(
      tasksCollection,
      InvalidTaskView,
      this.queryByHook('tasks-container'),
      {}
      //{reverse: true}
    )
  }
})

const InvalidTaskView = View.extend({
  template: `
    <li class="tasks-list-item">
      <!-- row -->
      <div class="">
        <span data-hook="task-name"></span>
      </div>
      <div class="" style="text-align: right;">
        <button type="button" class="btn btn-default" data-hook="edit-task">
          <i class="fa fa-edit"></i>
        </button>
      </div>
      <!-- row -->
      <ul data-hook="tasks-missconfiguration" class=""> </ul>
    </li>
  `,
  bindings: {
    'model.name': {
      hook: 'task-name'
    },
    'model.id': {
      hook: 'edit-task',
      type: 'attribute',
      name: 'data-task-id'
    }
  },
  render () {
    this.renderWithTemplate()

    const missing = this.model.missingConfiguration
      .map(missing => {
        return { label: missing.label }
      })

    const missingConfiguration = new Collection(missing)

    this.renderCollection(
      missingConfiguration,
      ({ model }) => {
        return new MissingConfigurationView({ label: model.label })
      },
      this.queryByHook('tasks-missconfiguration'),
      {}
    )

    this.listenTo(this.model, 'change', () => {
      if (this.model.missingConfiguration.length === 0) {
        const btn = this.queryByHook('edit-task')
        btn.disabled = true
        const icon = btn.querySelector('i')
        icon.classList.remove('fa-edit')
        icon.classList.add('fa-check')
        btn.classList.add('alert-success')
      }
    })
  }
})

const MissingConfigurationView = View.extend({ 
  props: {
    label: 'string',
  },
  template: `<li></li>`,
  bindings: {
    'label': { selector: 'li' }
  }
})
