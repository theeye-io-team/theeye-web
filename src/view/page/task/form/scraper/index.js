'use strict'

import App from 'ampersand-app'
import assign from 'lodash/assign'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import TaskActions from 'actions/task'
import PatternInputView from './pattern-input'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import EventsSelectView from 'view/events-select'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import CheckboxView from 'components/checkbox-view'
import Buttons from '../buttons'
import AdvancedToggle from '../advanced-toggle'
import CopyTaskSelect from '../copy-task-select'

import isURL from 'validator/lib/isURL'

const WEBHOOKS = require('constants/webhooks')
const TASK = require('constants/task')
const HelpTexts = require('language/help')

module.exports = FormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    // multiple only if new, allows to create multiple tasks at once
    let hostsSelection = new SelectView({
      label: 'Host *',
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

    const jsonBodyCheckbox = new CheckboxView({
      visible: false,
      label: 'JSON Body',
      name: 'json',
      value: this.model.json
    })

    const bodyTextarea = new TextareaView({
      visible: false,
      label: 'Request Body',
      name: 'body',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: this.model.body,
      tests: [
        function (value) {
          if (jsonBodyCheckbox.value===true) {
            try {
              JSON.parse(value)
            } catch (e) {
              return e.message
            }
          }
        }
      ]
    })

    bodyTextarea.listenTo(jsonBodyCheckbox,'change:value',() => {
      bodyTextarea.beforeSubmit()
    })

    this.advancedFields = [
      'json',
      'body',
      'description',
      'tags',
      'acl',
      'method',
      'gzip',
      'timeout',
      'triggers',
      'grace_time',
      'status_code',
      'pattern'
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
      new InputView({
        label: 'URL *',
        name: 'remote_url',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.remote_url,
        tests: [
          function (value) {
            if (!isURL(value)) {
              return 'valid url required'
            }
          }
        ]
      }),
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            this._fieldViews[name].toggle('visible')
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
        visible: false,
        label: 'Triggered by',
        name: 'triggers',
        value: this.model.triggers
      }),
      new SelectView({
        visible: false,
        label: 'Method',
        name: 'method',
        multiple: false,
        tags: false,
        options: WEBHOOKS.HTTP_METHODS.map(method => {
          return {
            id: method,
            text: method
          }
        }),
        value: this.model.method || 'GET',
        required: false,
        unselectedText: 'Select the HTTP method',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      jsonBodyCheckbox,
      bodyTextarea,
      new CheckboxView({
        visible: false,
        label: 'Use HTTP Compression',
        name: 'gzip',
        value: this.model.gzip || true
      }),
      new SelectView({
        label: 'Req. Timeout',
        visible: false,
        name: 'timeout',
        multiple: false,
        tags: false,
        options: WEBHOOKS.TIMEOUTS.map(time => {
          return {
            id: time.ms,
            text: time.text
          }
        }),
        value: this.model.timeout || 5000,
        required: false,
        unselectedText: 'Select the Req. Timeout',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new SelectView({
        visible: false,
        label: 'Trigger on-hold time',
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
        required: false,
        unselectedText: 'Select the Trigger on-hold time',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        visible: false,
        label: 'Success Status Code',
        name: 'status_code',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.status_code || 200,
        tests: [
          function (value) {
            let num = Number(value)
            if (!Number.isInteger(num) || num<0) {
              return 'a numberic value is required'
            }
          }
        ]
      }),
      new PatternInputView({
        visible: false,
        label: 'Success Pattern',
        name: 'pattern',
        pattern_value: this.model.pattern,
        use_parser: this.model.parser
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({ type: TASK.TYPE_SCRAPER })
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
    this.addHelpIcon('method')
    this.addHelpIcon('remote_url')
    this.addHelpIcon('json')
    this.addHelpIcon('body')
    this.addHelpIcon('grace_time')
    this.addHelpIcon('timeout')
    this.addHelpIcon('status_code')
    this.addHelpIcon('pattern')
    this.addHelpIcon('acl')
    this.addHelpIcon('triggers')
    this.addHelpIcon('gzip')

    const buttons = new Buttons()
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
    if (!this.valid) return next(null,false) // cancel submit

    let data = this.prepareData(this.data)
    if (!this.model.isNew()) {
      TaskActions.update(this.model.id, data)
    } else {
      TaskActions.createMany(data.hosts, data)
    }
    this.trigger('submit')
    next(null,true)
  },
  prepareData (data) {
    let f = assign({}, data)
    f.type = TASK.TYPE_SCRAPER
    f.timeout = Number(data.timeout)
    f.grace_time = Number(data.grace_time)
    f.status_code = Number(data.status_code)
    f.parser = this._fieldViews.pattern.use_parser // selected parser
    return f
  },
  setWithTask (task) {
    this.setValues({
      name: task.name,
      remote_url: task.remote_url,
      description: task.description,
      tags: task.tags,
      method: task.method,
      json: task.json,
      body: task.body,
      gzip: task.json,
      timeout: task.timeout,
      grace_time: task.grace_time,
      status_code: task.status_code,
      pattern: task.pattern,
    })
  }
})
