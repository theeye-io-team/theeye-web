import App from 'ampersand-app'
import assign from 'lodash/assign'
import HelpTexts from 'language/help'
import InputView from 'components/input-view'
import MembersSelectView from 'view/members-select'
import AdvancedToggle from 'view/advanced-toggle'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import EventsSelectView from 'view/events-select'
import TaskConstants from 'constants/task'
import Buttons from 'view/buttons'
import TaskActions from 'actions/task'
import TaskFormView from '../form'
import ArgumentsView from '../arguments-input'
import CopyTaskSelect from '../copy-task-select'
import RemoveButton from '../remove-button'
import bootbox from 'bootbox'

module.exports = TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    this.advancedFields = [
      'description',
      'tags',
      'acl',
      'triggers',
      'task_arguments',
      'remove-button',
      'copy_task'
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
        multiple: false,
        required: true,
        visible: true,
        name: 'approver_id',
        label: 'Approver *',
        idAttribute: 'id',
        textAttribute: 'label',
        value: this.model.approver_id,
        filterOptions: [
          item => {
            return item.credential !== 'viewer'
          }
        ],
      }),
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
      new ArgumentsView({
        visible: false,
        name: 'task_arguments',
        value: this.model.task_arguments
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({
        type: TaskConstants.TYPE_APPROVAL,
        visible: false
      })
      this.fields.splice(3, 0, copySelect)
      this.listenTo(copySelect,'change',() => {
        if (copySelect.value) {
          let task = App.state.tasks.get(copySelect.value)
          this.setWithTask(task)
        }
      })
    } else {
      let removeButton = new RemoveButton({ form: this })
      this.fields.push(removeButton)
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

    const buttons = this.buttons = new Buttons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })

    let acl = this._fieldViews.acl
    let approver = this._fieldViews.approver_id
    acl.listenToAndRun(approver, 'change:value', () => {
      let selected = approver.selected()
      if (!selected) return
      if (selected.credential==='user') {
        if (this.model.workflow_id) {
          bootbox.alert('Make sure the approver has the required ACL to the Workflow')
        }
        acl.setValue( acl.value.concat(selected.email) )
      }
    })
  },
  submit (next) {
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) { return next(null, false) }

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      TaskActions.update(this.model.id, data)
    } else {
      TaskActions.create(data)
    }

    next(null,true)
    this.trigger('submitted')
  },
  prepareData (data) {
    let f = assign({}, data)
    f.type = TaskConstants.TYPE_APPROVAL
    return f
  },
  setWithTask (task) {
    this.setValues({
      approver_id: task.approver_id,
      name: task.name,
      description: task.description,
      tags: task.tags,
      triggers: task.trigger || [],
      task_arguments: task.task_arguments || []
    })
  }
})
