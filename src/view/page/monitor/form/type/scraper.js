import App from 'ampersand-app'
import MonitorFormView from '../monitor-form'
import CopyMonitorSelect from '../copy-monitor-select'
import * as MonitorConstants from 'constants/monitor'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
import TextareaView from 'components/input-view/textarea'
import CheckboxView from 'components/checkbox-view'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import LooptimeSelectView from 'view/looptime-select'
import SeveritySelectView from 'view/severity-select'
import InputView from 'components/input-view'
import FormButtons from 'view/buttons'
import AdvancedToggle from 'view/advanced-toggle'
import isURL from 'validator/lib/isURL'
import * as WebhooksConstants from 'constants/webhooks'

export default MonitorFormView.extend({
  initialize (options) {
    let resource = this.model
    let monitor = resource.monitor

    const isNewMonitor = Boolean(resource.isNew())

    this.advancedFields = [
      'method',
      'timeout',
      'gzip',
      'json',
      'status_code',
      'body',
      'pattern',
      'description',
      'tags',
      'failure_severity',
      'acl'
    ]

    const hostsSelection = new SelectView({
      label: 'Bots',
      name: (isNewMonitor ? 'hosts' : 'host_id'),
      multiple: isNewMonitor,
      tags: isNewMonitor,
      options: App.state.hosts,
      value: monitor.host_id,
      required: true,
      unselectedText: 'File Host',
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
      contentType: 'json',
      prettyJson: true,
      visible: false,
      label: 'Request Body',
      name: 'body',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: monitor.body,
      tests: [
        value => {
          if (jsonBodyCheckbox.value === true) {
            try {
              JSON.parse(value)
            } catch (e) {
              return e.message
            }
          }
        }
      ]
    })

    bodyTextarea.listenTo(jsonBodyCheckbox, 'change:value', () => {
      bodyTextarea.beforeSubmit()
    })

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: resource.name
      }),
      hostsSelection,
      new InputView({
        label: 'URL *',
        name: 'remote_url',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.remote_url,
        tests: [
          function (value) {
            if (!isURL(value, {
              protocols: ['http', 'https'],
              require_protocol: true
            })) {
              return 'Must be a valid URL (include protocol)'
            }
          }
        ]
      }),
      new LooptimeSelectView({
        invalidClass: 'text-danger',
        required: true,
        value: monitor.looptime
      }),
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            this._fieldViews[name].toggle('visible')
          })
        }
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
        value: monitor.method || 'GET',
        required: false,
        unselectedText: 'Select the HTTP method',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      jsonBodyCheckbox,
      bodyTextarea,
      new SelectView({
        label: 'Req. Timeout',
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
        value: monitor.timeout || 5000,
        required: false,
        unselectedText: 'Select the Req. Timeout',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new CheckboxView({
        visible: false,
        label: 'HTTP Compression',
        name: 'gzip',
        value: monitor.gzip
      }),
      new InputView({
        label: 'Status Code',
        name: 'status_code',
        required: false,
        visible: false,
        placeholder: "Match e.g. '2[0-9][0-9]' for the group 2XX success status codes",
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.status_code || 200
      }),
      new InputView({
        label: 'Success Pattern',
        name: 'pattern',
        required: false,
        visible: false,
        placeholder: "e.g. '<h1>My Site Title</h1>', using RegEx ^[a-zA-Z0-9]{24}$",
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.pattern
      }),
      new TextareaView({
        label: 'Description',
        name: 'description',
        visible: false,
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: resource.description
      }),
      new TagsSelectView({
        required: false,
        visible: false,
        name: 'tags',
        value: resource.tags
      }),
      new MembersSelectView({
        required: false,
        visible: false,
        name: 'acl',
        label: 'ACL\'s',
        value: resource.acl
      }),
      new SeveritySelectView({
        required: false,
        visible: false,
        value: resource.failure_severity
      })
    ]

    if (isNewMonitor) {
      this.advancedFields.push('copy')
      const copySelect = new CopyMonitorSelect({
        type: MonitorConstants.TYPE_SCRAPER,
        visible: false
      })

      this.fields.splice(5, 0, copySelect)
      this.listenTo(copySelect,'change:value',() => {
        if (copySelect.value) {
          let monitor = App.state.resources.get(copySelect.value)
          this.setWithMonitor(monitor)
        }
      })
    }

    MonitorFormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    MonitorFormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    if (this.model.isNew()) {
      this.addHelpIcon('hosts')
      this.addHelpIcon('copy')
    } else {
      this.addHelpIcon('host_id')
    }
    this.addHelpIcon('name')
    this.addHelpIcon('remote_url')
    this.addHelpIcon('looptime')
    this.addHelpIcon('method')
    this.addHelpIcon('timeout')
    this.addHelpIcon('gzip')
    this.addHelpIcon('json')
    this.addHelpIcon('status_code')
    this.addHelpIcon('body')
    this.addHelpIcon('pattern')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('failure_severity')

    const buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  prepareData (data) {
    data.type = MonitorConstants.TYPE_SCRAPER
    data.looptime = this._fieldViews.looptime.selected().id
    if (data.pattern !== '') { data.parser = 'pattern' }
    return data
  },
  setWithMonitor (resource) {
    let monitor = resource.monitor
    this.setValues({
      name: resource.name,
      description: resource.description,
      tags: resource.tags,
      acl: resource.acl,
      failure_severity: resource.failure_severity,
      remote_url: monitor.remote_url,
      method: monitor.method,
      timeout: monitor.timeout,
      gzip: monitor.gzip,
      json: monitor.json,
      status_code: monitor.status_code,
      body: monitor.body,
      pattern: monitor.pattern,
    })
  }
})
