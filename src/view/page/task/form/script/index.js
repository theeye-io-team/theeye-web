import App from 'ampersand-app'
import bootbox from 'bootbox'
import View from 'ampersand-view'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import SelectView from 'components/select2-view'
import Buttons from 'view/buttons'
import TagsSelectView from 'view/tags-select'
import ScriptSelectView from 'view/script-select'
import ScriptImportView from 'view/script-import'
import MembersSelectView from 'view/members-select'
import EventsSelectView from 'view/events-select'
import AdvancedToggle from 'view/advanced-toggle'
import assign from 'lodash/assign'
import HelpTexts from 'language/help'
import TaskConstants from 'constants/task'

import TaskFormView from '../form'
import ArgumentsView from '../arguments-input'
import CopyTaskSelect from '../copy-task-select'
import TaskOnBoarding from '../../taskOnboarding'

module.exports = TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    // multiple only if new, allows to create multiple tasks at once
    let hostsSelection = new SelectView({
      label: 'Bots',
      name: (isNewTask?'hosts':'host_id'),
      multiple: isNewTask,
      tags: isNewTask,
      options: App.state.hosts,
      value: this.model.host_id,
      required: true,
      unselectedText: 'select a Bot',
      idAttribute: 'id',
      textAttribute: 'hostname',
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    if (this.isImport) {
      this.scriptSelection = new ScriptImportView({
        value: App.state.taskForm.file.filename,
        required: true,
        name: 'script_name',
        label: 'Script'
      })
    } else {
      this.scriptSelection = new ScriptSelectView({
        value: this.model.script_id,
        required: true
      })
    }

    this.advancedFields = [
      'script_runas',
      'description',
      'tags',
      'acl',
      'triggers',
      'grace_time',
      'task_arguments',
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
      hostsSelection ,
      this.scriptSelection ,
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
      new InputView({
        visible: false,
        label: 'Run As',
        name: 'script_runas',
        placeholder: 'sudo -u the_user %script%',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.script_runas,
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
        value: this.model.triggers,
        //tests: [
        //  (values) => {
        //    if (values.length===0) return
        //    if (this.hasDynamicArguments()) {
        //      return HelpTexts.task.cannot_trigger
        //    }
        //  }
        //]
      }),
      new SelectView({
        visible: false,
        label: 'Trigger on-hold time',
        name: 'grace_time',
        multiple: false,
        tags: false,
        options: TaskConstants.GRACE_TIME.map(gt => {
          return {
            id: gt.secs,
            text: gt.text
          }
        }),
        value: this.model.grace_time,
        required: false,
        unselectedText: 'Select the Trigger on-hold time',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new ArgumentsView({
        visible: false,
        name: 'task_arguments',
        value: this.model.task_arguments
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({ type: TaskConstants.TYPE_SCRIPT, visible: false })
      this.fields.splice(4, 0, copySelect)
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
      this.addHelpIcon('hosts')
      this.addHelpIcon('copy_task')
    } else {
      this.addHelpIcon('host_id')
    }
    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('script_runas')
    this.addHelpIcon('script_id')
    this.addHelpIcon('acl')
    this.addHelpIcon('triggers')
    this.addHelpIcon('grace_time')
    this.addHelpIcon('task_arguments')

    const buttons = this.buttons = new Buttons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })

    if (this.model.isNew()) {
      if(App.state.onboarding.onboardingActive) {
        var taskOnBoarding = new TaskOnBoarding({parent: this})
        taskOnBoarding.step2()

        this.listenTo(App.state.onboarding,'change:showTaskLastStep',() => {
          if (App.state.onboarding.showTaskLastStep) {
            taskOnBoarding.step4()
            App.state.onboarding.showTaskLastStep = false
          }
        })
      }
    }
  },
  submit (next) {
    next||(next=()=>{})

    this.beforeSubmit()
    if (!this.valid) return next(null, false)

    const hasDynamicArguments = this.hasDynamicArguments()

    // TODO: temporary NON-dynamic arguments validation
    // for scheduled tasks
    if (this.model.hasSchedules) {
      // this evaluation is copied from
      // model/task/template:hasDinamicArguments
      if (hasDynamicArguments) {
        bootbox.alert(HelpTexts.task.cannot_schedule)
        return next(null, false)
      }
    }

    let data = this.prepareData(this.data)
    if (this.isImport) {
      App.actions.file.create(App.state.taskForm.file, function (err, file) {
        data.script_id = file.id
        delete data.script_name
        App.actions.task.createMany(data.hosts, data)
      })
    } else {
      if (!this.model.isNew()) {
        App.actions.task.update(this.model.id, data)
      } else {
        App.actions.task.createMany(data.hosts, data)
      }
    }

    next(null, true)
    this.trigger('submitted')
  },
  prepareData (data) {
    let f = assign({}, data)
    f.type = TaskConstants.TYPE_SCRIPT
    f.grace_time = Number(data.grace_time)
    return f
  },
  setWithTask (task) {
    this.setValues({
      script_id: task.script_id,
      name: task.name,
      script_runas: task.script_runas,
      description: task.description,
      tags: task.tags,
      grace_time: task.grace_time,
      task_arguments: task.task_arguments
    })
  }
})
