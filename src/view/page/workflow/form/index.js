import App from 'ampersand-app'
import AdvancedToggle from 'view/advanced-toggle'
import LanguajeLabels from 'language/labels'
import FormView from 'ampersand-form-view'
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
//import WorkflowActions from 'actions/workflow'
import WorkflowBuilderView from './workflow-builder'
import EventsSelectView from 'view/events-select'
import bootbox from 'bootbox'
import isMongoId from 'validator/lib/isMongoId'
import { Factory as TaskFactory } from 'models/task'

export default FormView.extend({
  initialize (options) {
    const isNew = Boolean(this.model.isNew())

    this.advancedFields = [
      'acl',
      'tags',
      'description',
      'triggers',
      'table_view',
      'empty_viewers',
      'allows_dynamic_settings'
    ]

    App.actions.workflow.populate(this.model)
    const workflowBuilder = new WorkflowBuilderView({
      workflow_id: this.model.id,
      name: 'graph',
      value: this.model.graph,
      tasks: this.model.tasks
    })

    const startingTaskSelect = new StartingTaskSelectionView({
      value: this.model.start_task_id,
      options: this.model.tasks,
      onOpenning: (event) => {
        if (workflowBuilder.graph.nodes().length===0) {
          event.preventDefault()
          event.stopPropagation()
          bootbox.alert('To select the Starting Task, you have to add Workflow Events first')
          return false
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
      allowsDynamicSettings = (this.model.allows_dynamic_settings !== false)
    }

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      workflowBuilder,
      startingTaskSelect,
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
        value: this.model.description,
      }),
      new EventsSelectView({
        label: 'Triggered by',
        visible: false,
        name: 'triggers',
        value: this.model.triggers
      }),
      new TagsSelectView({
        required: false,
        visible: false,
        name: 'tags',
        value: this.model.tags
      }),
      new MembersSelectView({
        required: false,
        visible: false,
        name: 'acl',
        label: 'ACL\'s',
        value: this.model.acl
      }),
      new CheckboxView({
        required: false,
        visible: false,
        label: 'Table View',
        name: 'table_view',
        value: this.model.table_view
      }),
      new CheckboxView({
        required: false,
        visible: false,
        label: 'Only visible to assigned users',
        name: 'empty_viewers',
        value: this.model.empty_viewers
      }),
      new CheckboxView({
        required: false,
        visible: false,
        label: LanguajeLabels.page.task.form.allows_behaviour_change,
        name: 'allows_dynamic_settings',
        value: allowsDynamicSettings
      })
    ]

    this.listenTo(workflowBuilder, 'change:graphTasks', () => {
      startingTaskSelect.options = workflowBuilder.graphTasks
    })

    FormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
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
    FormView.prototype.remove.apply(this)
  },
  submit (next) {
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) {
      // cancel submit
      return next(null,false)
    }

    // id property is the required value, with "numeric" data type
    let data = this.prepareData(this.data)
    this.trigger('submit', data)
    next(null, true)
  },
  prepareData (data) {
    let f = Object.assign({}, data)
    delete f['advanced-toggler']
    return f
  }
})

const StartingTaskSelectionView = TaskSelectView.extend({
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
