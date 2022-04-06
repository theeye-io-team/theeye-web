import App from 'ampersand-app'
import DropableFormView from 'components/dropable-form'
import AdvancedToggle from 'view/advanced-toggle'
import LanguajeLabels from 'language/labels'
import FormButtons from 'view/buttons'
import SelectView from 'components/select2-view'
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

export default DropableFormView.extend({
  initialize (options) {
    const workflow = this.model
    const isNew = (workflow.isNew())

    this.advancedFields = [
      'acl',
      'tags',
      'description',
      'triggers',
      'table_view',
      'empty_viewers',
      'allows_dynamic_settings'
    ]

    const workflowBuilder = this.workflowBuilder = new WorkflowBuilderView({
      name: 'builder',
      value: workflow,
      mode: options.builder_mode
    })

    App.state.formWorkflow = {
      form: this,
      workflow,
      workflowBuilder
    }

    const initialTaskSelect = new InitialTaskSelectionView({
      value: workflowBuilder.workflow.start_task_id,
      options: workflowBuilder.workflow.tasks,
      onOpenning: (event) => {
        if (workflowBuilder.graph.nodes().length===0) {
          event.preventDefault()
          event.stopPropagation()
          bootbox.alert('To choose a Starting Task, first you must add a Task')
          return false
        }
      }
    })

    this.listenTo(workflowBuilder, 'change:graph', () => {
      if (initialTaskSelect.options.length === 0) {
        initialTaskSelect.options = [ ...workflowBuilder.workflow.tasks.models ]
        if (initialTaskSelect.options.length === 1) {
          initialTaskSelect.setValue( initialTaskSelect.options[0].id )
        }
      } else {
        const selected = initialTaskSelect.selected()
        initialTaskSelect.options = [ ...workflowBuilder.workflow.tasks.models ]
        if (initialTaskSelect.options.length === 0) {
          initialTaskSelect.setValue( null )
        } else {
          initialTaskSelect.setValue( selected?.id )
        }
      }
    })

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
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: workflow.name,
      }),
      workflowBuilder,
      initialTaskSelect,
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            var field = this._fieldViews[name]
            if (!field) return
            field.toggle('visible')
          })
        }
      }),
      new TextareaView({
        visible: false,
        label: 'More Info',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: workflow.description,
      }),
      new EventsSelectView({
        label: 'Triggered by',
        visible: false,
        name: 'triggers',
        value: workflow.triggers
      }),
      new TagsSelectView({
        required: false,
        visible: false,
        name: 'tags',
        value: workflow.tags
      }),
      new MembersSelectView({
        required: false,
        visible: false,
        name: 'acl',
        label: 'ACL\'s',
        value: workflow.acl
      }),
      new CheckboxView({
        required: false,
        visible: false,
        label: 'Table View',
        name: 'table_view',
        value: workflow.table_view
      }),
      new CheckboxView({
        required: false,
        visible: false,
        label: 'Only visible to assigned users',
        name: 'empty_viewers',
        value: workflow.empty_viewers
      }),
      new CheckboxView({
        required: false,
        visible: false,
        label: LanguajeLabels.page.task.form.allows_behaviour_change,
        name: 'allows_dynamic_settings',
        value: allowsDynamicSettings
      })
    ]

    DropableFormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    DropableFormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('table_view')
    this.addHelpIcon('empty_viewers')

    const buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
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
  remove () {
    DropableFormView.prototype.remove.apply(this)
  },
  submit (next) {
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) {
      const fields = this.getInvalidFields()
      const invalid = fields[0]
      if (invalid.name === 'builder') {
        App.state.alerts.danger('Some of the task are not ready.')
        //const reason = this.
      } else {
        invalid.el.scrollIntoView()
      }
      return
    }

    // id property is the required value, with "numeric" data type
    let data = this.prepareData(this.data)
    this.trigger('submit', data)
    next(null, true)
  },
  prepareData (data) {
    const { graph, tasks, events } = data.builder

    const wf = Object.assign({}, data, { graph, tasks, events })
    delete wf['advanced-toggler']
    delete wf['builder']
    return wf
  }
})

const InitialTaskSelectionView = TaskSelectView.extend({
  initialize (specs) {
    TaskSelectView.prototype.initialize.apply(this,arguments)

    this.required = true
    this.label = 'Starting Task'
    this.name = 'start_task_id'
    this.invalidClass = 'text-danger'

    const emptyFn = function(){}
    this.onOpenning = specs.onOpenning || emptyFn
  },
  render () {
    TaskSelectView.prototype.render.apply(this, arguments)
    this.$select.on('select2:opening', this.onOpenning)
  }
})
