'use strict'

import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import TaskActions from 'actions/task'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import TagsSelectView from 'view/tags-select'
import ArgumentsView from './arguments-input'
import assign from 'lodash/assign'
import Buttons from '../buttons'

const HelpTexts = require('language/help')
const TASK = require('constants/task')

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
      styles: 'form-group',
      required: false,
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
      required: false,
      idAttribute: 'id',
      textAttribute: 'filename',
      styles: 'form-group',
      unselectedText: 'select a script',
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
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
      scriptSelection ,
      new InputView({
        label: 'Run As',
        name: 'script_runas',
        placeholder: 'sudo -u the_user %script%',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.script_runas,
      }),
      new InputView({
        label: 'More Info',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.description,
      }),
      new TagsSelectView({
        name: 'tags',
        value: this.model.tags
      }),
      new SelectView({
        label: 'Grace Time',
        name: 'grace_time',
        multiple: false,
        tags: false,
        options: TASK.GRACE_TIME.map(gt => {
          return {
            id: gt.secs,
            text: gt.text
          }
        }),
        value: this.model.grace_time,
        styles: 'form-group',
        required: false,
        unselectedText: 'Select the Grace Time',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new ArgumentsView({
        name: 'taskArguments',
        value: this.model.taskArguments
      })
    ]

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
    this.addHelpIcon('host_id')
    this.addHelpIcon('tags')
    this.addHelpIcon('runas')

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
    if (!this.valid) return next(null,false)

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      TaskActions.update(this.model.id, data)
    } else {
      TaskActions.createMany(data.hosts, data)
    }
    next(null,true)
  },
  prepareData (data) {
    let f = assign({}, data)
    f.type = TASK.TYPE_SCRIPT
    f.grace_time = Number(data.grace_time)
    return f
  }
})
