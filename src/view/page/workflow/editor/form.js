import LanguajeLabels from 'language/labels'
import DropableFormView from 'components/dropable-form'
import FormButtons from 'view/buttons'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import TaskSelectView from 'view/task-select'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import EventsSelectView from 'view/events-select'
import * as WorkflowConstants from 'constants/workflow'
import HostSelectionComponent from './host-selection'
import ConstantsView from 'view/constants'

export default DropableFormView.extend({
  initialize (options) {
    const workflow = this.model
    const isNew = (workflow.isNew())

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
        value: 'Change the bot for all tasks',
        onSelection: (hostId) => {
          if (options.builder_mode === WorkflowConstants.MODE_EDIT) {
            App.actions.workflow.changeHost(this.model, hostId)
          } else { // import or create
            workflow.setHost(hostId)
          }
        }
      }),
      new TextareaView({
        height: 50,
        maxlength: 80,
        label: 'Short Description',
        name: 'short_description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: workflow.short_description,
      }),
      new TextareaView({
        label: 'Detailed Information',
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
      }),
      new CheckboxView({
        required: false,
        label: 'Multitasking',
        name: 'multitasking',
        value: workflow.multitasking
      }),
      new ConstantsView({
        name: 'global_constants',
        visible: true,
        values: (workflow.global_constants||{}),
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

    this.addHelpIcon('short_description')
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
  }
})
