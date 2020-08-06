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
import CheckboxView from 'components/checkbox-view'
import AdvancedToggle from 'view/advanced-toggle'
import * as TaskConstants from 'constants/task'

import TaskFormView from '../form'
import ArgumentsView from '../arguments-input'
import CopyTaskSelect from '../copy-task-select'
import TaskOnBoarding from '../../taskOnboarding'

export default TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    // multiple only if new, allows to create multiple tasks at once
    let hostsSelection = new SelectView({
      label: 'Bots',
      name: (isNewTask ? 'hosts' : 'host_id'),
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

    if (isNewTask) {
      if(App.state.onboarding.onboardingActive) {
        App.state.runners.add({
          runner: '/usr/bin/env bash %script%'
        })
      }
      this.listenTo(hostsSelection, 'change', () => {
        if (hostsSelection.value) {
          let hosts = []
          hostsSelection.value.forEach(hostId => {
            hosts.push( App.state.hosts.get(hostId) )
          })

          let os = hosts.map(host => host.os_name)
          if (os.length > 1) {
            bootbox.alert('BOT\'s with different OS versions has been selected.')
          }
        }
      })
    }

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
      'description',
      'acl',
      'triggers',
      'grace_time',
      'copy_task',
      'timeout',
      'multitasking',
      'env',
      'user_inputs',
      'user_inputs_members',
      'show_result'
    ]

    const requireUserInputs = new CheckboxView({
      visible: false,
      label: 'Require user interaction',
      name: 'user_inputs',
      value: this.model.user_inputs
    })

    const userInputsMembers = new MembersSelectView({
      //multiple: true,
      required: false,
      visible: false,
      name: 'user_inputs_members',
      value: this.model.user_inputs_members,
      label: 'Specific users interaction',
      idAttribute: 'id',
      textAttribute: 'label',
      filterOptions: [
        item => {
          return item.credential !== 'viewer'
        }
      ],
      enabled: (this.model.user_inputs === true)
    })

    let form = this
    requireUserInputs.on('change:value', (elem) => {
      userInputsMembers.enabled = (elem.value === true)
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
      hostsSelection ,
      this.scriptSelection ,
      new TagsSelectView({
        required: false,
        name: 'tags',
        value: this.model.tags
      }),
      new SelectView({
        label: 'Run As',
        name: 'script_runas',
        multiple: false,
        tags: true,
        allowCreateTags: true,
        options: App.state.runners,
        value: this.model.script_runas,
        required: true,
        unselectedText: 'select a runner',
        idAttribute: 'runner',
        textAttribute: 'runner',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      //new InputView({
      //  label: 'Run As',
      //  name: 'script_runas',
      //  placeholder: 'sudo -u the_user %script%',
      //  required: true,
      //  invalidClass: 'text-danger',
      //  validityClassSelector: '.control-label',
      //  value: this.model.script_runas
      //}),
      new ArgumentsView({
        name: 'task_arguments',
        value: this.model.task_arguments
      }),
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            var field = this._fieldViews[name]
            if (!field) return
            if (name === 'acl' && this.model.workflow_id) return
            field.toggle('visible')
          })
        }
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
        value: this.model.triggers,
      }),
      new SelectView({
        sort: false,
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
      new SelectView({
        sort: false,
        label: 'Execution Timeout',
        visible: false,
        name: 'timeout',
        multiple: false,
        tags: false,
        options: [
          {
            id: 10000,
            text: '10 secs'
          }, {
            id: 30000,
            text: '30 secs'
          }, {
            id: 60000,
            text: '1 min'
          }, {
            id: 300000,
            text: '5 mins'
          }, {
            id: 600000,
            text: '10 mins'
          }, {
            id: 1800000,
            text: '30 mins'
          }, {
            id: 3600000,
            text: '1 hour'
          }
        ],
        value: this.model.timeout || 600000,
        required: false,
        unselectedText: 'Select the Req. Timeout',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new CheckboxView({
        visible: false,
        label: 'Multitasking',
        name: 'multitasking',
        value: this.model.multitasking
      }),
      requireUserInputs,
      userInputsMembers,
      new CheckboxView({
        visible: false,
        label: 'Result Popup',
        name: 'show_result',
        value: this.model.show_result
      }),
      new TextareaView({
        prettyJson: true,
        visible: false,
        label: 'Environment (env)',
        name: 'env',
        //placeholder: '',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: JSON.stringify(this.model.env),
        tests: [
          value => {
            if (value === '') { return }
            try {
              let parsed = JSON.parse(value)
              if (Array.isArray(parsed)) {
                return 'Use {Key:Value} format'
              }
              if (parsed.hasOwnProperty("")) {
                return 'Please, don\'t do that..'
              }
            } catch (e) {
              return 'Invalid JSON string'
            }
          }
        ]
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({ type: TaskConstants.TYPE_SCRIPT, visible: false })
      this.fields.splice(7, 0, copySelect)
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
    this.addHelpIcon('timeout')
    this.addHelpIcon('env')
    this.addHelpIcon('multitasking')
    this.addHelpIcon('user_inputs')
    this.addHelpIcon('user_inputs_members')
    this.addHelpIcon('show_result')

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
    next || (next=()=>{})

    this.beforeSubmit()
    if (!this.valid) {
      return next(null, false)
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
    let f = Object.assign({}, data)
    f.type = TaskConstants.TYPE_SCRIPT
    f.grace_time = Number(data.grace_time)
    f.timeout = Number(data.timeout)
    if (data.env) {
      f.env = JSON.parse(data.env)
    } else {
      f.env = {}
    }

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
      task_arguments: task.task_arguments,
      timeout: task.timeout
    })
  }
})
