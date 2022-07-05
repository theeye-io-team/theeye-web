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
            <i class="fa fa-pencil" data-hook="edit-name"></i>
          </div>
          <div class="controls-block view-controls-block">
            <div class="btn" data-hook="fit">
              <i class="fa fa-expand"></i> Fit
            </div>
            <div class="btn" data-hook="center">
              <i class="fa fa-dot-circle-o"></i> Center
            </div>
            <div class="btn" data-hook="redraw">
              <i class="fa fa fa-repeat"></i> Redraw
            </div>
          </div>
          <div class="controls-block workflow-controls">
            <div class="btn" data-hook="new">
              <i class="fa fa-plus"></i> Add new task
            </div>
            <div class="btn" data-hook="existing">
              <i class="fa fa-search-plus"></i> Add existing task
            </div>
            <div class="btn" data-hook="settings">
              <i class="fa fa-cog"></i> Settings
            </div>
          </div>
          <div class="btn close" data-hook="close">
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
            <span>There's nothing to worry about.</span>
          </div>
          <div class="submit-buttons controls-block">
            <button data-hook="cancel" class="btn btn-default">Cancel</button>
            <button data-hook="submit" class="btn">Submit</button>
          </div>
        </div>
        <div class="advanced-options-panel" data-hook="advanced-options-panel"> </div>
      </div>
    `
  },
  initialize (options) {
    View.prototype.initialize.apply(this, arguments)
    this.name = this.model.name 
  },
  events: {
    'click [data-hook=edit-name]': 'onNameEdit',
    'click [data-hook=fit]': 'onClickFit',
    'click [data-hook=center]': 'onClickCenter',
    'click [data-hook=redraw]': 'onClickRedraw',
    'click [data-hook=new]': 'onClickNew',
    'click [data-hook=existing]': 'onClickExisting',
    'click [data-hook=settings]': 'onAdvancedOptionsToggle',
    'click [data-hook=submit]': 'onClickSubmitButton',
    'click button[data-hook=warning-indicator]':'onClickWarningIndicator',
  },
  props: {
    builder_mode: ['string', true],
    advancedOptionsToggled: ['boolean', true, false],
    name: 'string',
    valid: ['boolean', true, true]
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

    this.form = new AdvancedOptionsForm({
      model: this.model,
      mode: this.builder_mode
    })

    this.renderSubview(this.form, this.queryByHook('advanced-options-panel'))
  },
  beforeSubmit () {
    this.form.beforeSubmit()
    this.valid = Boolean(this.name && this.form.valid && this.workflowBuilder.valid)
  },
  onClickSubmitButton (event) {
    event.preventDefault()
    event.stopPropagation()

    this.beforeSubmit()
    if (!this.valid) {
      this.onClickWarningIndicator()
    } else {
      const data = this.form.data

      const { graph, tasks, start_task_id } = this.workflowBuilder.value
      const name = this.name
      const wf = Object.assign({}, data, { graph, tasks, start_task_id, name })
      this.trigger('submit', wf)
    }
  },
  onNameEdit (event) {
    event.preventDefault()
    event.stopPropagation()

    const input = this.queryByHook('name')
    input.disabled = false
    input.focus()
    input.select()

    input.addEventListener('focusout', () => {
      this.name = input.value
      input.disabled = true
    })
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
  onClickNew (event) {
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
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
      
    const dialog = new TasksReviewDialog({
      fade: false,
      center: true,
      workflow: this.model,
      buttons: false,
      title: `Tasks review`,
    })

    this.registerSubview(dialog)
    dialog.show()
    dialog.el.addEventListener('click [data-hook=edit-task]', (event) => {
      const task = event.detail.task
      EditTask(task, () => {
        this.workflowBuilder.updateTaskNode(task)
      })
    })
  },
})
