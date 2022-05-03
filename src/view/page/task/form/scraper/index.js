import App from 'ampersand-app'
import TaskFormView from '../form'
import PatternInputView from './pattern-input'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import EventsSelectView from 'view/events-select'
import InputView from 'components/input-view'
import TextareaView from 'components/input-view/textarea'
import CheckboxView from 'components/checkbox-view'
import AdvancedToggle from 'view/advanced-toggle'
import isURL from 'validator/lib/isURL'
import * as WebhooksConstants from 'constants/webhooks'
import * as TaskConstants from 'constants/task'
import HelpTexts from 'language/help'

import CopyTaskSelect from '../copy-task-select'

export default TaskFormView.extend({
  initialize (options) {
    const isNewTask = Boolean(this.model.isNew())

    const hostsSelection = new SelectView({
      label: 'Bot *',
      multiple: false,
      name: 'host_id',
      tags: false,
      options: App.state.hosts,
      value: this.model.host_id,
      required: true,
      unselectedText: 'select a Host',
      idAttribute: 'id',
      textAttribute: 'hostname',
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      autoselectSingleOption: true
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
      'acl',
      'method',
      'gzip',
      'timeout',
      'triggers',
      'grace_time',
      'status_code',
      'pattern',
      'copy_task',
      'multitasking',
      'register_body',
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
      new TagsSelectView({
        required: false,
        name: 'tags',
        value: this.model.tags
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
        visible: false,
        label: 'Triggered by',
        name: 'triggers',
        filterOptions: [
          item => {
            return item.emitter_id !== this.model.id
          }
        ],
        value: this.model.triggers
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
      new SelectView({
        visible: false,
        label: 'Method',
        name: 'method',
        multiple: false,
        tags: false,
        options: WebhooksConstants.HTTP_METHODS.map(method => {
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
      new CheckboxView({
        visible: false,
        label: 'Collect and persist response body',
        name: 'register_body',
        value: (this.model.register_body || false)
      }),
      new SelectView({
        label: 'Req. Timeout',
        sort: false,
        visible: false,
        name: 'timeout',
        multiple: false,
        tags: false,
        options: WebhooksConstants.TIMEOUTS.map(time => {
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
      }),
      new CheckboxView({
        visible: false,
        label: 'Multitasking',
        name: 'multitasking',
        value: this.model.multitasking
      })
    ]

    if (this.model.isNew()) {
      const copySelect = new CopyTaskSelect({
        type: TaskConstants.TYPE_SCRAPER,
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
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    TaskFormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    if (this.model.isNew()||this.mode==='import') {
      this.addHelpIcon('hosts')
    } else {
      this.addHelpIcon('host_id')
    }

    if (this.model.isNew()) {
      this.addHelpIcon('copy_task')
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
    this.addHelpIcon('register_body')
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
    TaskFormView.prototype.remove.apply(this)
  },
  prepareData (data) {
    let f = Object.assign({}, data)
    f.type = TaskConstants.TYPE_SCRAPER
    f.timeout = Number(data.timeout)
    f.grace_time = Number(data.grace_time)
    f.status_code = Number(data.status_code)
    f.parser = this._fieldViews.pattern.use_parser // selected parser
    return f
  }
})
