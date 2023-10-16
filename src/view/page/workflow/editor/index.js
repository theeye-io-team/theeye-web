import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import View from 'ampersand-view'
import WorkflowBuilderView from './workflow-builder'
import TasksReviewDialog from './task-review-dialog'
import AdvancedOptionsForm from './form'
import EditTask from './edit-task'

import './styles.less'

export default View.extend({
  template () {
    return `
      <div data-component="workflow-editor-component" class="workflow-editor-container">
        <div class="top-block">
          <div class="controls-block name-block">
            <input name="name" type="text" class="name-input" disabled placeholder="Untitled workflow" data-hook="name">
            <button class="btn" data-hook="edit-name">
              <i class="fa fa-pencil"></i>
            </button>
          </div>
          <div class="controls-block view-controls-block">
            <button class="btn" data-hook="fit">
              <i class="fa fa-expand"></i> Fit
            </button>
            <button class="btn" data-hook="center">
              <i class="fa fa-dot-circle-o"></i> Center
            </button>
            <button class="btn" data-hook="redraw">
              <i class="fa fa fa-repeat"></i> Redraw
            </button>
          </div>
          <div class="controls-block workflow-controls">
            <button class="btn" data-hook="create">
              <i class="fa fa-plus"></i> Add new task
            </button>
            <button class="btn" data-hook="existing">
              <i class="fa fa-search-plus"></i> Add existing task
            </button>
            <button class="btn" data-hook="settings">
              <i class="fa fa-cog"></i> Settings
            </button>
          </div>
          <div class="btn close">
            <button type="button" data-hook="close" class="close" aria-label="Close">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        <div class="main-block" data-hook="workflow-graphview-container"> </div>
        <div class="bottom-block">
          <div class="controls-block">
            <button class="btn action-required" data-hook="warning-indicator" disabled>
              <i class="fa fa-warning"></i>
            </button>
            <span data-hook="warning-message"></span>
          </div>
          <div class="submit-buttons controls-block">
            <button data-hook="submit" class="btn">Submit</button>
            <button data-hook="cancel" class="btn btn-default">Cancel</button>
          </div>
        </div>
        <div class="advanced-options-panel" data-hook="advanced-options-panel"> </div>
      </div>
    `
  },
  initialize (options) {
    View.prototype.initialize.apply(this, arguments)
    this.name = this.model.name 

    this.on('change:name', () => {
      this.validate()
    })
  },
  events: {
    'click input[data-hook=name]': 'onNameEdit',
    'click button[data-hook=edit-name]': 'onNameEdit',
    'click button[data-hook=fit]': 'onClickFit',
    'click button[data-hook=center]': 'onClickCenter',
    'click button[data-hook=redraw]': 'onClickRedraw',
    'click button[data-hook=create]': 'onClickCreate',
    'click button[data-hook=existing]': 'onClickExisting',
    'click button[data-hook=settings]': 'onAdvancedOptionsToggle',
    'click button[data-hook=submit]': 'onClickSubmitButton',
    'click button[data-hook=warning-indicator]': 'onClickWarningIndicator',
  },
  props: {
    builder_mode: ['string', true],
    advancedOptionsToggled: ['boolean', true, false],
    name: 'string',
    valid: ['boolean', true, true],
    warningMessage: ['string', false, '']
  },
  bindings: {
    name: {
      type: 'value',
      hook: 'name'
    },
    advancedOptionsToggled: {
      type: 'booleanClass',
      no: 'hidden',
      hook: 'advanced-options-panel'
    },
    warningMessage: {
      type: 'innerHTML',
      hook: 'warning-message'
    },
    valid: [
      {
        type: 'booleanClass',
        yes: 'btn-success',
        no: 'btn-danger',
        hook: 'submit'
      }, {
        type: 'booleanClass',
        name: 'btn-danger',
        hook: 'warning-indicator',
        invert: true
      }, {
        type: 'booleanAttribute',
        name: 'disabled',
        hook: 'warning-indicator'
      }
    ]
  },
  render () {
    this.renderWithTemplate(this)

    this.workflowBuilder = new WorkflowBuilderView({
      value: this.model,
      mode: this.builder_mode
    })

    this.renderSubview(
      this.workflowBuilder,
      this.queryByHook('workflow-graphview-container')
    )

    this.listenTo(this.workflowBuilder, 'change:valid change:value', () => {
      this.beforeSubmit()
    })
    // builder internal state
    this.listenTo(this.workflowBuilder.workflow, 'change:start_task_id', () => {
      this.beforeSubmit()
    })

    this.form = new AdvancedOptionsForm({
      model: this.model,
      mode: this.builder_mode
    })

    this.warningTasksDialog = new TasksReviewDialog({
      fade: false,
      center: true,
      workflow: this.model,
      buttons: false,
      title: `Tasks Review`,
    })

    this.registerSubview(this.warningTasksDialog)

    this.renderSubview(this.form, this.queryByHook('advanced-options-panel'))

    const input = this.queryByHook('name')
    //input.addEventListener('focusout', () => {
    //  this.name = input.value
    //  input.disabled = true
    //})
    input.addEventListener('blur', () => {
      this.name = input.value
      input.disabled = true
    })

    this.validate()
  },
  beforeSubmit () {
    this.form.beforeSubmit()
    this.validate()
  },
  validate () {
    if (!this.name) {
      this.valid = false
      this.warningMessage = 'The workflow needs a name'
      return
    }
    if (!this.workflowBuilder.valid) {
      this.valid = false
      const builder = this.workflowBuilder.value
      if (builder.tasks.length === 0) {
        // no tasks added
        this.valid = false
        this.warningMessage = 'Great! Add at least one Task'
        return
      } else if (this.workflowBuilder.workflow.getInvalidTasks().length > 0) {
        // there are invalid tasks
        const incompleteTask = this.workflowBuilder.workflow.getInvalidTasks().models[0]
        const missingProp = incompleteTask.missingConfiguration[0].label
        this.warningMessage = `Task <b>${incompleteTask.name}</b> to finish: <b>${missingProp}</b>`
      } else if (!builder.start_task_id) {
        // starting task not defined
        this.warningMessage = 'The workflow needs a starting task'
      } else {
        this.warningMessage = `Ups...something is wrong`
      }
      return
    }
    if (!this.form.isValid()) {
      this.valid = false
      this.warningMessage = 'Check advanced settings'
      return
    }
    this.valid = true
    this.warningMessage = 'The Workflow is ready <i class="fa fa-check"></i>'
    return
  },
  onClickSubmitButton (event) {
    event.preventDefault()
    event.stopPropagation()

    this.beforeSubmit()
    if (this.valid) {
      const data = this.form.data

      const { graph, tasks, start_task_id } = this.workflowBuilder.value
      const name = this.name
      const wf = Object.assign({}, data, { graph, tasks, start_task_id, name })
      this.trigger('submit', wf)
    //} else {
    //  this.showWarningTasksDialog()
    }
  },
  onNameEdit (event) {
    event.preventDefault()
    event.stopPropagation()

    const input = this.queryByHook('name')
    input.disabled = false
    input.focus()
    input.select()
  },
  onClickFit (event) {
    event.preventDefault()
    event.stopPropagation()
    this.workflowBuilder.workflowGraph.cy.fit()
  },
  onClickCenter (event) {
    event.preventDefault()
    event.stopPropagation()
    this.workflowBuilder.workflowGraph.cy.center()
  },
  onClickRedraw (event) {
    event.preventDefault()
    event.stopPropagation()
    this.workflowBuilder.workflowGraph.updateCytoscape(true)
  },
  onClickCreate (event) {
    this.workflowBuilder.onClickCreateTask(event)
  },
  onClickExisting (event) {
    this.workflowBuilder.onClickAddTask(event)
  },
  onAdvancedOptionsToggle (event) {
    event.preventDefault()
    event.stopPropagation()
    this.advancedOptionsToggled = !this.advancedOptionsToggled
  },
  onClickWarningIndicator (event) {
    event.preventDefault()
    event.stopPropagation()
    this.showWarningTasksDialog()
  },
  showWarningTasksDialog () {
    this.warningTasksDialog.show()
    this.warningTasksDialog.el.addEventListener('click [data-hook=edit-task]', (event) => {
      const task = event.detail.task
      EditTask(task, () => {
        this.workflowBuilder.updateTaskNode(task)
      })
    })
  }
})
