import App from 'ampersand-app'
import HelpTexts from 'language/help'
import InputView from 'components/input-view'
import ActivatableInputView from 'components/input-view/activatable'
import MembersSelectView from 'view/members-select'
import AdvancedToggle from 'view/advanced-toggle'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import EventsSelectView from 'view/events-select'
import * as TaskConstants from 'constants/task'
import Buttons from 'view/buttons'
import TaskFormView from '../form'
import ArgumentsView from '../arguments-input'
import CopyTaskSelect from '../copy-task-select'
import bootbox from 'bootbox'
import HelpIcon from 'components/help-icon'

export default TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    this.advancedFields = [
      'description',
      'acl',
      'triggers',
      'copy_task',
      'success_label',
      'failure_label',
      'cancel_label',
      'ignore_label',
    ]

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      new MembersSelectView({
        //multiple: true,
        required: true,
        visible: true,
        name: 'approvers',
        label: 'Approvers *',
        idAttribute: 'user_id',
        textAttribute: 'label',
        value: this.model.approvers,
        //filterOptions: [
        //  item => {
        //    return item.credential !== 'viewer'
        //  }
        //]
      }),
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
        label: 'Success Label',
        visible: false,
        name: 'success_label',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.success_label
      }),
      new ActivatableInputView({
        label: 'Failure Label',
        visible: false,
        name: 'failure_label',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.failure_label
      }),
      new ActivatableInputView({
        label: 'Cancel Label',
        visible: false,
        name: 'cancel_label',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.cancel_label
      }),
      new ActivatableInputView({
        label: 'Ignore Label',
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
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({
        type: TaskConstants.TYPE_APPROVAL,
        visible: false
      })
      this.fields.splice(5, 0, copySelect)
      this.listenTo(copySelect,'change',() => {
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
    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
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
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) { return next(null, false) }

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      App.actions.task.update(this.model.id, data)
    } else {
      App.actions.task.create(data)
    }

    next(null,true)
    this.trigger('submitted')
  },
  prepareData (data) {
    let f = Object.assign({}, data)
    f.type = TaskConstants.TYPE_APPROVAL

    if (data.cancel_label === '') {
      data.cancel_enabled = false
    }
    if (data.success_label === '') {
      data.success_enabled = false
    }
    if (data.failure_label === '') {
      data.failure_enabled = false
    }
    if (data.ignore_label === '') {
      data.ignore_enabled = false
    }
    return f
  }
})
