import App from 'ampersand-app'
import View from 'ampersand-view'
import Collection from 'ampersand-collection'
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
import CreateTaskWizard from 'view/page/task/creation-wizard'
import ExportDialog from 'view/page/task/buttons/export/dialog'
import uuidv4 from 'uuid'
import isMongoId from 'validator/lib/isMongoId'
import * as TaskConstants from 'constants/task'
import * as WorkflowConstants from 'constants/workflow'

import './styles.less'

//const MODE_EDIT   = 'edit'
//const MODE_IMPORT = 'import'

const TaskAdderInput = View.extend({
  template: `
    <div data-component="workflow-builder" class="workflow-builder-component form-group">
      <div style="padding-bottom: 15px;" data-hook="buttons">
        <button data-hook="add-task" title="Existent Task" class="btn btn-default">
          Add Existent Task <i class="fa fa-wrench"></i>
        </button>
        <button data-hook="create-task" title="Create Task" class="btn btn-default">
          Add New Task <i class="fa fa-plus-circle"></i>
        </button>
      </div>
    </div>
  `,
  events: {
    'click [data-hook=add-task]':'onClickAddTask',
    'click [data-hook=create-task]':'onClickCreateTask'
  },
  props: {
    onClickAddTask: 'function',
    onClickCreateTask: 'function'
  },
  derived: {
    valid: { fn() { return true }},
    value: { fn() { return null }}
  }
})

export default View.extend({
  template: `
      <div class="workflow-preview" data-hook="graph-preview"></div>
  `,
  initialize (options) {
    View.prototype.initialize.apply(this,arguments)

    this.TaskAdder = new TaskAdderInput({
      onClickAddTask: (e) => this.onClickAddTask(e),
      onClickCreateTask: (e) => this.onClickCreateTask(e)
    })

    let recipe
    let workflow = options.value

    const version = workflow.version
    if (this.mode === WorkflowConstants.MODE_EDIT) {
      recipe = workflow.serialize()
    } else if (this.mode === WorkflowConstants.MODE_IMPORT) {
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
        this.purgeGraph()
        const { graph, tasks, node_positions, start_task_id } = this.workflow.serialize()
        return { graph, tasks, node_positions, start_task_id }
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
  render () {
    this.renderWithTemplate(this)
    this.renderWorkflowGraph()
  },
  renderWorkflowGraph () {
    import(/* webpackChunkName: "workflow-view" */ 'view/workflow')
      .then(({ default: WorkflowView }) => {
        const workflowGraph = new WorkflowView({ graph: this.graph, start_task_id: this.start_task_id })
        this.renderSubview(workflowGraph, this.queryByHook('graph-preview'))

        const updateVisualization = () => {
          workflowGraph.updateCytoscape(this.workflow.graph)
          this.parent.valid
        }

        this.on('change:graph', updateVisualization)
        this.workflow.tasks.on('change', updateVisualization)

        this.listenTo(workflowGraph, 'tap:node', this.onTapNode)
        this.listenTo(workflowGraph, 'tap:edge', this.onTapEdge)
        this.listenTo(workflowGraph, 'tap:back', (e) => { this.onTapBackground(e, workflowGraph) })
        this.listenTo(workflowGraph, 'change:node_positions', () => {
          this.workflow.node_positions = workflowGraph.node_positions
        })
        this.listenTo(workflowGraph, 'change:start_task_id', () => {
          this.workflow.start_task_id = workflowGraph.start_task_id
        })

        this.listenTo(this.workflow, 'change:start_task_id', () => {
          workflowGraph.setStartNode(this.workflow.start_task_id)
          workflowGraph.updateCytoscape(this.workflow.node_positions)
        })

        this.listenToAndRun(this, 'change:valid', () => {
          workflowGraph.warningToggle = !this.valid
        })
        
        // initial render
        setTimeout(() => {
          if (this.workflow.start_task_id)
            workflowGraph.setStartNode(this.workflow.start_task_id)
          workflowGraph.updateCytoscape(this.workflow.node_positions)
          workflowGraph.cy.center()
        }, 500)
      })
  },
  onTapNode (event) {
    var node = event.cyTarget.data()

    if (/Task$/.test(node.value._type) === true) {
      const id = node.value.id
      const task = this.workflow.tasks.get(id)
      if (this.connectingTask !== undefined) {
        const taskOrigin = this.connectingTask
        this.connectingTask = undefined
        this.connectTasks(taskOrigin, task)
      } else {
        if (this.menuView) {
          this.menuView.remove()
        } else {
          const menu_items = [
            {
              label: 'Edit Task',
              action: () => {
                editTask(task, () => {
                  this.updateTaskNode(task)
                })
              }
            },
            (() => { if (task.type === 'script') return {
              label: 'Edit Script',
              action: () => {
                App.actions.file.edit(task.script_id || task.script)
              }
            }})(),
            {
              label: 'Set starting task',
              action: () => {
                this.workflow.start_task_id = task.id
              }
            },
            {
              label: 'Remove',
              action: () => {
                this.removeNodeDialog(node)
              }
            },
            {
              label: 'Export',
              action: () => {
                const dialog = new ExportDialog({ model: task })
              }
            },
            {
              label: 'Copy Task',
              action: () => {
                this.addTaskNode(task)
              }
            },
            {
              label: 'Connect to',
              action: () => {
                this.connectingTask = task
              }
            }
          ]
          
          this.menuView = new ContextualMenu({ menu_items })
          this.menuView.render()
          
          this.menuView.el.style.position = 'absolute'
          this.menuView.el.style.top = (event.cyRenderedPosition.y + 15) + 'px'
          this.menuView.el.style.left = (event.cyRenderedPosition.x + 15) + 'px'
        
          this.el.appendChild(this.menuView.el)
          this.registerSubview(this.menuView)

          this.menuView.on('remove', () => {
            setTimeout(()=>{
              this.menuView = null
            }, 500)
          })
        }
      }
    } else {
      this.removeNodeDialog(node)
    }
  },
  onTapEdge (event) {
    var edge = event.cyTarget.data()
    this.removeEdgeDialog(edge)
  },
  onTapBackground (event, graphView) {
    if (this.menuView) {
      this.menuView.remove()
    } else {
      const menu_items = [
        {
          label: 'Fit graph',
          action: () => { event.cy.fit() }
        },
        {
          label: 'Center graph',
          action: () => { event.cy.center() }
        },
        {
          label: 'Rearrange nodes',
          action: () => {
            graphView.updateCytoscape()
          }
        },
        (()=>{
          if (graphView.clearBtn === true) return {
            label: 'Clear graph',
            action: () => {
              graphView.trigger('click:clear')
            }
          } 
        })()
      ]

      this.menuView = new ContextualMenu({ menu_items })
      this.menuView.render()
      
      this.menuView.el.style.position = 'absolute'
      this.menuView.el.style.top = (event.cyRenderedPosition.y + 15) + 'px'
      this.menuView.el.style.left = (event.cyRenderedPosition.x + 15) + 'px'
    
      this.el.appendChild(this.menuView.el)
      this.registerSubview(this.menuView)

      this.menuView.on('remove', () => {
        setTimeout(()=>{
          this.menuView = null
        }, 500)
      })
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

    this.parent.taskAdderToggled = false

    const taskSelection = new TaskSelectionForm()

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

    this.parent.taskAdderToggled = false

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
  },
  purgeGraph () {
    if(this.graph.nodes().includes('START_NODE')) 
      this.graph.removeNode('START_NODE')
  }
})

const editTask = (task, done) => {
  let mode
  if (!task.script_id) {
    mode = WorkflowConstants.MODE_IMPORT
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

const TaskSelectionForm = FormView.extend({
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

const ContextualMenu = View.extend({
  template: `
    <div class="dropdown">
      <ul class="dropdown-menu" style="display: block;" data-hook="menu-buttons"></ul>
    </div>
  `,
  props: {
    menu_items: 'array',
    workflow_events: 'collection'
  },
  render () {
    this.renderWithTemplate(this)
    this.menu_items.forEach((item) => {
      if (item)
        this.renderSubview(
          new ContextualMenuEntry({...item}),
          this.queryByHook('menu-buttons')
        )
      }
    )
  }
})

const ContextualMenuEntry = View.extend({
  props: {
    label: 'string',
    action: 'function'
  },
  template: `<li><a href="#"></a></li>`,
  bindings: {
    label: {
      type: 'innerHTML',
      selector: 'a'
    }
  },
  events: {
    'click a': 'onClick'
  },
  onClick (event) {
    event.stopPropagation()
    event.preventDefault()
    this.action()
    this.parent.remove()
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
    this.eventName = new InputView({
      label: 'Event Name',
      name: 'eventName',
      required: true,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      placeholder: 'use "success" to go in a single direction',
      value: 'success'
    })

    this.fields = [ this.eventName ]
    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    const buttons = new FormButtons({ confirmText: 'Confirm' })
    this.renderSubview(buttons)
    buttons.on('click:confirm', this.submit, this)

    const eventMessage = new EventsMessage({
      currentEventName: this.currentEventName,
      eventName: this.eventName.value // initial value
    })

    this.renderSubview(eventMessage, this.query('.form-group'))

    this.eventName.input.addEventListener('keyup', () => {
      eventMessage.eventName = this.eventName.input.value
    })
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
    currentEventName: 'string',
    eventName: 'string'
  },
  bindings: {
    currentEventName: {
      type: 'toggle',
      hook: 'currentEventName'
    },
    eventName: {
      hook: 'eventName'
    }
  },
  template () {
    return (`
    <div class="event-message">
      <section data-hook="currentEventName">
        <b>Warning</b> The current event ${this.currentEventName} will be replaced.</br>
      </section>
      <section>
        Keep in mind that if you use an event different than "success" it must be considered in the script.</br>
        For example if the event is named "continue" an "event_name" property should be added like this</br>
      </section>
      <section class="code-container">
        <code class="javascript">
          // this must be the last line of the script</br>
          {"event_name":"<span data-hook="eventName">${this.eventName}</span>","data": []}
        </code>
      </section>
    </div>
  `)
  }
})
