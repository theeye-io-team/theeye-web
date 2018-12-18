import App from 'ampersand-app'
import assign from 'lodash/assign'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
import MembersSelectView from 'view/members-select'
import AdvancedToggle from 'view/advanced-toggle'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import EventsSelectView from 'view/events-select'
import TaskConstants from 'constants/task'
import Buttons from 'view/buttons'
import TaskFormView from '../form'
import CopyTaskSelect from '../copy-task-select'

module.exports = TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    this.advancedFields = [
      'description',
      'tags',
      'acl',
      'triggers',
      'copy_task'
    ]

    const emailCheckbox = new CheckboxView({
      visible: true,
      label: 'Send email',
      name: 'email',
      value: this.model.notificationTypes.email
    })

    const desktopCheckbox = new CheckboxView({
      visible: true,
      label: 'Send desktop notification',
      name: 'desktop',
      value: this.model.notificationTypes.desktop
    })

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      new InputView({
        label: 'Subject *',
        name: 'subject',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.subject,
      }),
      emailCheckbox,
      desktopCheckbox,
      new TextareaView({
        visible: (isNewTask ? false : this.model.notificationTypes.email),
        label: 'Email body',
        name: 'body',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.body
      }),
      new MembersSelectView({
        required: true,
        visible: true,
        name: 'recipients',
        label: 'Send to',
        value: this.model.recipients
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
      new MembersSelectView({
        required: false,
        visible: false,
        name: 'acl',
        label: 'ACL\'s',
        value: this.model.acl
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({
        type: TaskConstants.TYPE_NOTIFICATION,
        visible: false
      })
      this.fields.splice(7, 0, copySelect)
      this.listenTo(copySelect,'change',() => {
        if (copySelect.value) {
          let task = App.state.tasks.get(copySelect.value)
          this.setWithTask(task)
        }
      })
    }

    this.listenTo(emailCheckbox, 'change:value', () => {
      this._fieldViews['body'].toggle('visible')
    })

    TaskFormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    TaskFormView.prototype.render.apply(this, arguments)

    this.query('form').classList.add('form-horizontal')

    if (this.model.isNew()) {
      this.addHelpIcon('copy_task')
    }
    this.addHelpIcon('name')
    this.addHelpIcon('subject')
    this.addHelpIcon('email')
    this.addHelpIcon('desktop')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('triggers')
    this.addHelpIcon('acl')

    const buttons = this.buttons = new Buttons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
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
    let f = assign({}, data)
    f.notificationTypes = {
      push: true,
      email: data.email,
      socket: false,
      desktop: data.desktop
    }
    f.type = TaskConstants.TYPE_NOTIFICATION
    return f
  },
  setWithTask (task) {
    this.setValues({
      name: task.name,
      description: task.description,
      tags: task.tags,
      triggers: task.trigger || [],
      subject: task.subject,
      body: task.body,
      notificationTypes: task.notificationTypes,
      recipients: task.recipients
    })
  }
})