import App from 'ampersand-app'
import Modalizer from 'components/modalizer'
import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import DropableFormView from 'components/dropable-form'
import AdvancedToggle from 'view/advanced-toggle'
import LanguajeLabels from 'language/labels'
import FormButtons from 'view/buttons'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import TaskSelectView from 'view/task-select'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import WorkflowBuilderView from './workflow-builder'
import EventsSelectView from 'view/events-select'
import bootbox from 'bootbox'
import { Factory as TaskFactory } from 'models/task'
import HostSelectionComponent from './host-selection'
import * as WorkflowConstants from 'constants/workflow'
import TasksReviewDialog from './task-review-dialog'

import './styles.less'

export default View.extend({
  old_template: `
    <div class="workflow-editor-container">
      <div class="workflow-graphview-container" data-hook="workflow-graphview-container"></div>
      <div class="gui-container">
        <input type="text" class="name-input" placeholder="Untitled workflow" data-hook="name">
        <div class="submit-buttons">
          <button data-hook="cancel" class="btn btn-default">Cancel</button>
          <button data-hook="submit" class="btn">Submit</button>
          <button class="btn action-required" data-hook="warning-indicator" disabled>
            <i class="fa fa-warning"></i>
          </button>
        </div>
        <i class="advanced-options-toggler fa fa-cog" data-hook="advanced-options-toggler"></i>
        <div class="task-adder-container" data-hook="task-adder-container">
          <div class="task-adder" data-hook="task-adder"></div>
          <i class="fa fa-plus-circle plus-icon task-adder-toggler" data-hook="task-adder-toggler"></i>
        </div>
        <div class="advanced-options-container" data-hook="advanced-options-container"></div>
      </div>
    </div>
  `,
  template: `
    <div class="workflow-editor-container">
      <div class="top-bar">
        <div class="name-container container">
          <input type="text" class="name-input" disabled placeholder="Untitled workflow" data-hook="name">
          <i class="fa fa-pen" data-hook="edit-name"></i>
        </div>
        <div class="view-controls-container container">
          <div class="fit-btn btn" data-hook="fit">
            <i class="fa fa-expand"></i> Fit
          </div>
          <div class="center-btn btn" data-hook="center">
            <i class="fa fa-dot-circle"></i> Center
          </div>
          <div class="redraw-btn btn" data-hook="redraw">
            <i class="fa fa-project-diagram"></i> Redraw
          </div>
        </div>
        <div class="workflow-controls-container container">
          <div class="new-btn btn" data-hook="new">
            <i class="fa fa-plus"></i> Add new task
          </div>
          <div class="existing-btn btn" data-hook="existing">
            <i class="fa fa-search-plus"></i> Add existing task
          </div>
          <div class="settings-btn btn" data-hook="settings">
            <i class="fa fa-cog"></i> Settings
          </div>
        </div>
        <div class="close" data-hook="close">
          <i class="fa fa-times"></i>
        </div>
      </div>
      <div class="graph-container" data-hook="workflow-graphview-container">
      </div>
      <div class="bottom-bar">
        <div class="action required-container">
          <button class="btn action-required" data-hook="warning-indicator" disabled>
            <i class="fa fa-warning"></i>
          </button>
          <span>There's nothing to worry about.</span>
        </div>
        <div class="submit-buttons">
          <button data-hook="cancel" class="btn btn-default">Cancel</button>
          <button data-hook="submit" class="btn">Submit</button>
        </div>
      </div>
      <div class="advanced-options-container" data-hook="advanced-options-container"></div>
    </div>
  `,
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
    'click [data-hook=close]': 'onClickClose'
  },
  props: {
    advancedOptionsToggled: ['boolean', true, false],
    name: 'string',
    isValid: ['boolean', true, false]
  },
  derived: {
    valid: {
      required: ['name', 'form', 'workflowBuilder'],
      cache: false,
      fn() {
        this.isValid = Boolean(this.name && this.form.valid && this.workflowBuilder.valid)
        return this.isValid
      }
    }
  },
  bindings: {
    name: {
      type: 'value',
      hook: 'name'
    },
    advancedOptionsToggled: {
      type: 'booleanClass',
      no: 'hidden',
      hook: 'advanced-options-container'
    },
    isValid: [
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
      editTask(task, () => {
        this.workflowBuilder.updateTaskNode(task)
      })
    })
  },
  initialize (options) {
    this.name = this.model.name 

    this.workflowBuilder = new WorkflowBuilderView({
      value: this.model,
      mode: options.builder_mode
    })
    this.form = new Form({
      model: this.model,
      mode: options.builder_mode,
      workflowBuilder: this.workflowBuilder
    })
    App.state.formWorkflow = {
      workflow: this.model,
      form: this.form,
      workflowBuilder: this.workflowBuilder
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.renderSubview(
      this.workflowBuilder,
      this.queryByHook('workflow-graphview-container')
    )
    this.renderSubview(
      this.form,
      this.queryByHook('advanced-options-container')
    )

    this.valid
  },
  onClickSubmitButton(event) {
    event.preventDefault()
    event.stopPropagation()

    this.valid ? this.beforeSubmit() : this.onClickWarningIndicator()
  },
  onClickClose (event) {
    event.preventDefault()
    event.stopPropagation()

    this.trigger('close')
  },
  beforeSubmit () {
    this.form.submit((data) => this.submit(data))
  },
  submit (data) {
    const { graph, tasks, start_task_id } = this.workflowBuilder.value
    const name = this.name
    const wf = Object.assign({}, data, { graph, tasks, start_task_id, name })
    console.log(wf)
    this.trigger('submit', wf)
  },
  update (field) { this.form.update(field) }
})

const Form = FormView.extend({
  initialize (options) {
    const workflow = this.model
    const isNew = (workflow.isNew())

    const workflowBuilder = this.workflowBuilder = options.workflowBuilder

    // backward compatibility.
    // new task will be forbidden.
    // old tasks will only be false if it is explicitly false
    let allowsDynamicSettings
    if (isNew) {
      allowsDynamicSettings = false
    } else {
      allowsDynamicSettings = (workflow.allows_dynamic_settings !== false)
    }

    this.fields = [
      new HostSelectionComponent({
        value: 'Change the Bot for all tasks',
        onSelection: (hostId) => {
          if (options.builder_mode === WorkflowConstants.MODE_EDIT) {
            App.actions.workflow.changeHost(this.model, hostId)
          } else { // import or create
            workflow.setHost(hostId)
          }
        }
      }),
      new TextareaView({
        label: 'More Info',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: workflow.description,
      }),
      new EventsSelectView({
        label: 'Triggered by',
        name: 'triggers',
        value: workflow.triggers
      }),
      new TagsSelectView({
        required: false,
        name: 'tags',
        value: workflow.tags
      }),
      new MembersSelectView({
        required: false,
        name: 'acl',
        label: 'ACL\'s',
        value: workflow.acl
      }),
      new CheckboxView({
        required: false,
        label: 'Table View',
        name: 'table_view',
        value: workflow.table_view
      }),
      new CheckboxView({
        required: false,
        label: 'Only visible to assigned users',
        name: 'empty_viewers',
        value: workflow.empty_viewers
      }),
      new CheckboxView({
        required: false,
        label: LanguajeLabels.page.task.form.allows_behaviour_change,
        name: 'allows_dynamic_settings',
        value: allowsDynamicSettings
      })
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('table_view')
    this.addHelpIcon('empty_viewers')
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.monitor[field]
      }),
      view.query('label')
    )
  },
  getValid () {
    return this.valid
  },
  submit (next) {
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) {
      const fields = this.getInvalidFields()
      const invalid = fields[0]
      this.parent.advancedOptionsToggled = true
      invalid.el.scrollIntoView()
      return
    }

    // id property is the required value, with "numeric" data type
    next(this.data)
  }
})