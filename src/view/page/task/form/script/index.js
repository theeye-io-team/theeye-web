import isDataUrl from 'valid-data-url'
import App from 'ampersand-app'
import bootbox from 'bootbox'
import View from 'ampersand-view'
import InputView from 'components/input-view'
import LanguajeLabels from 'language/labels'
import TextareaView from 'components/input-view/textarea'
import SelectView from 'components/select2-view'
import TagsSelectView from 'view/tags-select'
import ScriptSelectView from 'view/script-select'
import MembersSelectView from 'view/members-select'
import EventsSelectView from 'view/events-select'
import CheckboxView from 'components/checkbox-view'
import AdvancedToggle from 'view/advanced-toggle'
import * as TaskConstants from 'constants/task'

import HostSelectionView from 'view/host-select'
import ScriptImportView from './file-import'
import TaskFormView from '../form'
import ArgumentsView from '../arguments-input'
// import { ValueOption as ArgumentValueOption } from 'models/task/dynamic-argument'
import CopyTaskSelect from '../copy-task-select'
import TaskOnBoarding from '../../taskOnboarding'
import ConstantsView from 'view/constants'

//import './styles.less'

export default TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew()) // or is import

    const hostsSelection = new HostSelectionView({
      label: 'Bot *',
      multiple: false,
      tags: false,
      name: 'host_id',
      value: this.model.host_id,
      required: true
    })

    if (isNewTask) {
      if (App.state.onboarding.onboardingActive) {
        App.state.runners.add({
          runner: '/usr/bin/env bash %script%'
        })
      }
    }

    if (
      this.mode === 'import'
      //|| isDataUrl(this.model.script.data)
    ) { // imported script
      this.scriptSelection = new ScriptImportView({
        file: this.model.script.serialize(),
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
      'short_description',
      'acl',
      'triggers',
      'grace_time',
      'copy_task',
      'timeout',
      'multitasking',
      'cancellable',
      'env',
      'user_inputs',
      'user_inputs_members',
      'show_result',
      //'arguments_type',
      'allows_dynamic_settings',
      'agent_logging'
    ]

    this.advancedToggle = new AdvancedToggle({
      onclick: (event) => {
        // just toggle
        if (Array.isArray(this.advancedFields)) {
          this.advancedFields.forEach(name => {
            const field = this._fieldViews[name]
            if (!field) { return }
            if (name === 'acl' && this.model.workflow_id) { return }
            field.toggle('visible')
          })
        }
      }
    })

    const requireUserInputs = new CheckboxView({
      visible: false,
      label: 'Require user interaction',
      name: 'user_inputs',
      value: this.model.user_inputs
    })

    const userInputsMembers = new MembersSelectView({
      // multiple: true,
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

    const form = this
    requireUserInputs.on('change:value', (elem) => {
      userInputsMembers.enabled = (elem.value === true)
    })

    const triggeredBy = new EventsSelectView({
      label: 'Triggered by',
      name: 'triggers',
      filterOptions: [
        item => {
          return item.emitter_id !== this.model.id
        }
      ],
      visible: false,
      value: this.model.triggers,
    })

    const triggerOnHold = new SelectView({
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
    })

    triggerOnHold.listenTo(triggeredBy, 'change:value', () => {
      if (triggeredBy.value.length > 0) {
        triggerOnHold.enabled = true
      } else {
        triggerOnHold.enabled = false
        triggerOnHold.clear()
      }
    })

    const runners = this.runners = new RunnerSelectionView({
      value: this.model.script_runas
    })

    runners.listenToAndRun(this.scriptSelection, 'change', () => {
      runners.updateState({ selector: this.scriptSelection })
    })

    // backward compatibility.
    // new task will be forbidden.
    // old tasks will only be false if it is explicitly false
    const allowsDynamicSettings = isNewTask ? false : (this.model.allows_dynamic_settings !== false)

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      hostsSelection,
      this.scriptSelection,
      new TagsSelectView({
        required: false,
        name: 'tags',
        value: this.model.tags
      }),
      runners,
      new ArgumentsView({
        name: 'task_arguments',
        value: this.model.task_arguments
      }),
      this.advancedToggle,
      // advanced fields starts visible = false
      new TextareaView({
        height: 50,
        maxlength: 80,
        visible: false,
        label: 'Short Description',
        name: 'short_description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.short_description,
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
      triggeredBy,
      triggerOnHold,
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
          }, {
            id: 14400000,
            text: '4 hour'
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
      new CheckboxView({
        required: false,
        visible: false,
        label: 'Is cancellable',
        name: 'cancellable',
        value: this.model.cancellable
      }),
      requireUserInputs,
      userInputsMembers,
      new CheckboxView({
        visible: false,
        label: 'Result Popup',
        name: 'show_result',
        value: this.model.show_result
      }),
      new ConstantsView({
        values: (this.model.env||{})
      }),
      //new SelectView({
      //  label: 'Arguments Type (experimental)',
      //  name: 'arguments_type',
      //  visible: false,
      //  required: false,
      //  options: [
      //    { id: TaskConstants.ARGUMENT_TYPE_LEGACY, value: `${TaskConstants.ARGUMENT_TYPE_LEGACY} (Deprecated)` },
      //    { id: TaskConstants.ARGUMENT_TYPE_TEXT, value: `${TaskConstants.ARGUMENT_TYPE_TEXT} (Default)` },
      //    { id: TaskConstants.ARGUMENT_TYPE_JSON, value: `${TaskConstants.ARGUMENT_TYPE_JSON} (SDK Default)` }
      //  ],
      //  value: argumentsType,
      //  unselectedText: '',
      //  idAttribute: 'id',
      //  textAttribute: 'value',
      //  invalidClass: 'text-danger',
      //  validityClassSelector: '.control-label'
      //}),
      new CheckboxView({
        required: false,
        visible: false,
        label: LanguajeLabels.page.task.form.allows_behaviour_change,
        name: 'allows_dynamic_settings',
        value: allowsDynamicSettings
      }),
      new CheckboxView({
        visible: false,
        label: 'Agent Execution Logging',
        name: 'agent_logging',
        value: this.model.agent_logging
      }),
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({
        type: TaskConstants.TYPE_SCRIPT,
        visible: false
      })

      this.fields.splice(7, 0, copySelect)
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

    //if (this.model.isNew()) {
    //  this.addHelpIcon('hosts')
    //} else {
    //  this.addHelpIcon('host_id')
    //}
    this.addHelpIcon('host_id')

    if (this.model.isNew()) {
      this.addHelpIcon('copy_task')
    }

    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('short_description')
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
    //this.addHelpIcon('arguments_type')
    this.addHelpIcon('agent_logging')

    if (this.model.isNew()) {
      if (App.state.onboarding.onboardingActive) {
        var taskOnBoarding = new TaskOnBoarding({ parent: this })
        taskOnBoarding.step2()

        this.listenTo(App.state.onboarding, 'change:showTaskLastStep', () => {
          if (App.state.onboarding.showTaskLastStep) {
            taskOnBoarding.step4()
            App.state.onboarding.showTaskLastStep = false
          }
        })
      }
    }

    if (!this.runners.value) {
      if (this.scriptSelection.selected()) {
        this.runners.updateState({ selector: this.scriptSelection })
      }
    }
  },
  prepareData (data) {
    let f = Object.assign({}, data)
    f.type = TaskConstants.TYPE_SCRIPT
    f.grace_time = Number(data.grace_time)
    f.timeout = Number(data.timeout)
    return f
  }
})

const RunnerSelectionView = SelectView.extend({
  initialize (specs) {
    this.label = 'Run As'
    this.name = 'script_runas'
    this.multiple = false
    this.tags = true
    this.allowCreateTags = true
    this.options = App.state.runners
    this.required = true
    this.unselectedText = 'select a runner'
    this.idAttribute = 'runner'
    this.textAttribute = 'runner'
    this.requiredMessage = 'Selection required'
    this.invalidClass = 'text-danger'
    this.validityClassSelector = '.control-label'

    SelectView.prototype.initialize.apply(this, arguments)
  },
  updateState ({ selector }) {
    if (!this.rendered) { return }
    if (!selector?.value) { return }

    const script = selector.selected()
    const interpreter = App.state.runners.detectInterpreterByScript(script)
    if (interpreter !== null) {
      if (
        !this.value ||
        (
          interpreter.runner !== this.value &&
          App.state.runners.isDefaultRunner(this.value)
        )
      ) {
        this.setValue(interpreter.runner)
      }
    }
  }
})
