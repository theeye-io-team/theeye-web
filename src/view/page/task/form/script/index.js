'use strict'

import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import TaskActions from 'actions/task'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import EventsSelectView from 'view/events-select'
import ArgumentsView from './arguments-input'
import assign from 'lodash/assign'
import Buttons from '../buttons'
import AdvancedToggle from '../advanced-toggle'
import CopyTaskSelect from '../copy-task-select'

import bootbox from 'bootbox'
import FIELD from 'constants/field'

const HelpTexts = require('language/help')
const TaskConstants = require('constants/task')

const cannotBeTriggered = 'A Task with dynamic arguments cannot be automatically triggered by Workflow'
const cannotBeScheduled = 'A Scheduled Task cannot have dynamic input/select arguments'

module.exports = FormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    // multiple only if new, allows to create multiple tasks at once
    let hostsSelection = new SelectView({
      label: 'Host',
      name: (isNewTask?'hosts':'host_id'),
      multiple: isNewTask,
      tags: isNewTask,
      options: App.state.hosts,
      value: this.model.host_id,
      required: true,
      unselectedText: 'select a host',
      idAttribute: 'id',
      textAttribute: 'hostname',
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    let scriptSelection = new SelectView({
      label: 'Script',
      name: 'script_id',
      multiple: false,
      tags: false,
      options: App.state.scripts,
      value: this.model.script_id,
      required: true,
      idAttribute: 'id',
      textAttribute: 'filename',
      unselectedText: 'select a script',
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    this.advancedFields = [
      'script_runas',
      'description',
      'tags',
      'acl',
      'triggers',
      'grace_time',
      'taskArguments'
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
      scriptSelection ,
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            this._fieldViews[name].toggle('visible')
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
        label: 'Trigger on',
        name: 'triggers',
        visible: false,
        value: this.model.triggers,
        tests: [
          () => {
            if (this.hasDynamicArguments()) {
              return cannotBeTriggered
            }
          }
        ]
      }),
      new SelectView({
        visible: false,
        label: 'Grace Time',
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
        unselectedText: 'Select the Grace Time',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new ArgumentsView({
        visible: false,
        name: 'taskArguments',
        value: this.model.taskArguments
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({ type: TaskConstants.TYPE_SCRIPT })
      this.fields.unshift(copySelect)
      this.listenTo(copySelect,'change',() => {
        if (copySelect.value) {
          let task = App.state.tasks.get(copySelect.value)
          this.setWithTask(task)
        }
      })
    }

    FormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
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
    this.addHelpIcon('taskArguments')

    const buttons = this.buttons = new Buttons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.task.form[field]
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
    if (!this.valid) return next(null, false)

    const hasDynamicArguments = this.hasDynamicArguments()

    //if (this.data.triggers.length>0) {
    //  if (hasDynamicArguments) {
    //    bootbox.alert(cannotBeTriggered)
    //    return next(null, false)
    //  }
    //}

    // TODO: temporary NON-dynamic arguments validation
    // for scheduled tasks
    if (this.model.hasSchedules) {
      // this evaluation is copied from
      // model/task/template:hasDinamicArguments
      if (hasDynamicArguments) {
        bootbox.alert(cannotBeScheduled)
        return next(null, false)
      }
    }

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      TaskActions.update(this.model.id, data)
    } else {
      TaskActions.createMany(data.hosts, data)
    }

    next(null,true)
    this.trigger('submit')
  },
  prepareData (data) {
    let f = assign({}, data)
    f.type = TaskConstants.TYPE_SCRIPT
    f.grace_time = Number(data.grace_time)
    return f
  },
  hasDynamicArguments () {
    return this.data.taskArguments.find(arg => {
      return arg.type && (
        arg.type === FIELD.TYPE_INPUT ||
        arg.type === FIELD.TYPE_SELECT
      )
    })
  },
  setWithTask (task) {
    this.setValues({
      script_id: task.script_id,
      name: task.name,
      script_runas: task.script_runas,
      description: task.description,
      tags: task.tags,
      grace_time: task.grace_time,
      taskArguments: task.taskArguments
    })
  }
})
