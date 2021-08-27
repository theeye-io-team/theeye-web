import App from 'ampersand-app'
import HelpTexts from 'language/help'
import LanguajeLabels from 'language/labels'
import InputView from 'components/input-view'
import ActivatableInputView from 'components/input-view/activatable'
import AdvancedToggle from 'view/advanced-toggle'
import TextareaView from 'components/input-view/textarea'
import * as TaskConstants from 'constants/task'
import Buttons from 'view/buttons'
import TaskFormView from '../form'
import ArgumentsView from '../arguments-input'
import bootbox from 'bootbox'
import HelpIcon from 'components/help-icon'
import CheckboxView from 'components/checkbox-view'

import CopyTaskSelect from '../copy-task-select'
import MembersSelectView from 'view/members-select'
import TagsSelectView from 'view/tags-select'
import EventsSelectView from 'view/events-select'
import SelectView from 'components/select2-view'

export default TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    this.advancedFields = [
      'description',
      'acl',
      'table_view',
      'triggers',
      'copy_task',
      'success_label',
      'failure_label',
      'cancellable',
      'cancel_label',
      'ignore_label',
      'allows_dynamic_settings'
    ]

    const approval_labels = LanguajeLabels.page.task.form.approval
    const approvalTargetSelectionView = new SelectView({
      required: true,
      visible: true,
      name: 'approvals_target',
      label: 'Who will approve?',
      options: [
        {
          id: TaskConstants.APPROVALS_TARGET_INITIATOR,
          text: approval_labels.target_initiator
        },
        {
          id: TaskConstants.APPROVALS_TARGET_ASSIGNEES,
          text: approval_labels.target_assignees
        },
        {
          id: TaskConstants.APPROVALS_TARGET_DYNAMIC,
          text: approval_labels.target_dynamic
        },
        {
          id: TaskConstants.APPROVALS_TARGET_FIXED,
          text: approval_labels.target_fixed
        }
      ],
      value: (this.model.approvals_target || 'fixed'),
    })

    const approverSelectView = new MembersSelectView({
      required: (this.model.approvals_target === 'fixed'),
      visible: true,
      name: 'approvers',
      label: 'Choose the Approvers',
      idAttribute: 'user_id',
      textAttribute: 'label',
      value: this.model.approvers
    })

    approverSelectView.listenTo(
      approvalTargetSelectionView,
      'change:value',
      () => {
        if (approvalTargetSelectionView.value === 'fixed') {
          approverSelectView.enabled = true
          approverSelectView.required = true
          approverSelectView.visible = true
        } else {
          approverSelectView.enabled = false
          approverSelectView.required = false
          approverSelectView.visible = false
        }
      }
    )

    const cancelCheckbox = new CheckboxView({
      required: false,
      visible: false,
      label: 'Is cancellable by user',
      name: 'cancellable',
      value: this.model.cancellable
    })

    const cancelLabel = new ActivatableInputView({
      defaultText: 'Cancel',
      label: 'Cancel Buton Label',
      name: 'cancel_label',
      required: false,
      visible: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: this.model.cancel_label,
      disabled: !this.model.cancellable
    })

    cancelLabel.listenTo(cancelCheckbox, 'change:value', () => {
      if (cancelCheckbox.value === true) {
        cancelLabel.disabled = false
      } else {
        cancelLabel.setValue("") 
        cancelLabel.disabled = true
      }
    })

    // backward compatibility.
    // new task will be forbidden.
    // old tasks will only be false if it is explicitly false
    let allowsDynamicSettings
    if (isNewTask) {
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
      approvalTargetSelectionView,
      approverSelectView,
      new TagsSelectView({
        required: false,
        name: 'tags',
        value: this.model.tags
      }),
      new ArgumentsView({
        name: 'task_arguments',
        label: 'Expected input',
        value: this.model.task_arguments
      }),
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            var field = this._fieldViews[name]
            if (!field) { return }
            if (name === 'acl' && this.model.workflow_id) { return }
            field.toggle('visible')
          })
        }
      }),
      new ActivatableInputView({
        defaultText: 'Approve',
        label: 'Success Button Label',
        visible: false,
        name: 'success_label',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.success_label
      }),
      new ActivatableInputView({
        defaultText: 'Reject',
        label: 'Failure Button Label',
        visible: false,
        name: 'failure_label',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.failure_label
      }),
      cancelCheckbox,
      cancelLabel,
      new ActivatableInputView({
        defaultText: 'Ignore',
        label: 'Ignore Button Label',
        visible: false,
        name: 'ignore_label',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.ignore_label
      }),
      new TextareaView({
        visible: false,
        label: 'Description',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.description,
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
      new EventsSelectView({
        label: 'Triggered by',
        name: 'triggers',
        filterOptions: [
          item => {
            return item.emitter_id !== this.model.id
          }
        ],
        visible: false,
        value: this.model.triggers
      }),
      new CheckboxView({
        required: false,
        visible: false,
        label: LanguajeLabels.page.task.form.allows_behaviour_change,
        name: 'allows_dynamic_settings',
        value: allowsDynamicSettings
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({
        type: TaskConstants.TYPE_APPROVAL,
        visible: false
      })
      this.fields.splice(5, 0, copySelect)
      this.listenTo(copySelect, 'change', () => {
        if (copySelect.value) {
          let task = App.state.tasks.get(copySelect.value)
          this.setWithTask(task)
        }
      })
    }

    TaskFormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    TaskFormView.prototype.render.apply(this, arguments)

    this.query('form').classList.add('form-horizontal')

    if (this.model.isNew()) {
      this.addHelpIcon('copy_task')
    }
    this.addHelpIcon('cancellable')
    this.addHelpIcon('allows_dynamic_settings')
    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('table_view')
    this.addHelpIcon('triggers')
    this.addHelpIcon('success_label')
    this.addHelpIcon('failure_label')
    this.addHelpIcon('ignore_label')
    this.addHelpIcon('cancel_label')

    const taskArgumentsView = this._fieldViews['task_arguments']
    taskArgumentsView.renderSubview(
      new HelpIcon({
        text: HelpTexts.task.form['approval_task_arguments']
      }),
      taskArgumentsView.query('label')
    )

    const buttons = this.buttons = new Buttons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })

    let acl = this._fieldViews.acl
    let approvers = this._fieldViews.approvers
    acl.listenToAndRun(approvers, 'change:value', () => {
      let userSelected = false
      let selected = approvers.selected()
      if (!selected) { return }
      selected.forEach(function (approver) {
        if (approver.credential === 'user') {
          userSelected = true
          acl.setValue(acl.value.concat(approver.email))
        }
      })

      if (userSelected && this.model.workflow_id) {
        bootbox.alert('Make sure the approvers are in the ACL of the Workflow')
      }
    })
  },
  submit (next) {
    next || (next = () => { })

    this.beforeSubmit()
    if (!this.valid) { return next(null, false) }

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      App.actions.task.update(this.model.id, data)
    } else {
      App.actions.task.create(data)
    }

    next(null, true)
    this.trigger('submitted')
  },
  prepareData (data) {
    const f = Object.assign({}, data)
    f.type = TaskConstants.TYPE_APPROVAL

    f.cancel_enabled = (data.cancel_label !== '' && data.cancellable !== false)
    f.success_enabled = (data.success_label !== '')
    f.failure_enabled = (data.failure_label !== '')
    f.ignore_enabled = (data.ignore_label !== '')
    return f
  }
})
