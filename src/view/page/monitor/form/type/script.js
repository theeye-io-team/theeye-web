import App from 'ampersand-app'
import MonitorFormView from '../monitor-form'
import CopyMonitorSelect from '../copy-monitor-select'
import * as MonitorConstants from 'constants/monitor'
import SelectView from 'components/select2-view'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
import LooptimeSelectView from 'view/looptime-select'
import ScriptSelectView from 'view/script-select'
import SeveritySelectView from 'view/severity-select'
import InputView from 'components/input-view'
import AdvancedToggle from 'view/advanced-toggle'
import FormButtons from 'view/buttons'

export default MonitorFormView.extend({
  initialize (options) {
    let resource = this.model
    let monitor = resource.monitor

    const isNewMonitor = Boolean(resource.isNew())

    let hostsSelection = new SelectView({
      label: 'Bots',
      name: (isNewMonitor?'hosts':'host_id'),
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

    let scriptSelection = new ScriptSelectView({
      value: monitor.script_id,
      required: true
    })
    // multiple only if new, allows to create multiple tasks at once
    this.advancedFields = [
      'description','script_arguments','tags','failure_severity','acl'
    ]

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.name
      }),
      hostsSelection,
      scriptSelection,
      new LooptimeSelectView({
        invalidClass: 'text-danger',
        required: true,
        value: monitor.looptime
      }),
      new SelectView({
        label: 'Run As',
        name: 'script_runas',
        multiple: false,
        tags: true,
        allowCreateTags: true,
        options: App.state.runners,
        value: monitor.script_runas,
        required: true,
        unselectedText: 'select a runner',
        idAttribute: 'runner',
        textAttribute: 'runner',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      // advanced fields starts visible = false
      new AdvancedToggle({
        onclick: (event) => {
          this.advancedFields.forEach(name => {
            this._fieldViews[name].toggle('visible')
          })
        }
      }),
      //new InputView({
      //  label: 'Run As',
      //  name: 'script_runas',
      //  required: false,
      //  visible: false,
      //  placeholder: 'sudo -u username %script%',
      //  invalidClass: 'text-danger',
      //  validityClassSelector: '.control-label',
      //  value: monitor.script_runas,
      //  tests: [
      //    (value) => {
      //      if (/%script%/.test(value) === false) {
      //        return '"%script%" keyword is required'
      //      }
      //    }
      //  ]
      //}),
      new InputView({
        label: 'Script Arguments',
        name: 'script_arguments',
        required: false,
        visible: false,
        placeholder: "eg: --exclude-dir='node_modules'",
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.script_arguments.join(',')
      }),
      new TextareaView({
        label: 'Description',
        name: 'description',
        required: false,
        visible: false,
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
        value: resource.failure_severity || 'LOW'
      })
    ]

    if (isNewMonitor) {
      this.advancedFields.push('copy')
      const copySelect = new CopyMonitorSelect({
        type: MonitorConstants.TYPE_SCRIPT,
        visible: false
      })

      this.fields.splice(6, 0, copySelect)
      this.listenTo(copySelect, 'change:value', () => {
        if (copySelect.value) {
          let resource = App.state.resources.get(copySelect.value)
          this.setWithResource(resource)
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
    this.addHelpIcon('description')
    this.addHelpIcon('looptime')
    this.addHelpIcon('script_id')
    this.addHelpIcon('script_runas')
    this.addHelpIcon('script_arguments')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('failure_severity')

    const buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  prepareData (data) {
    data.type = MonitorConstants.TYPE_SCRIPT
    data.looptime = this._fieldViews.looptime.selected().id
    data.script_arguments = data.script_arguments
      .split(',')
      .filter(str => Boolean(str))
      .map(str => str.trim())

    return data
  },
  setWithResource (resource) {
    let monitor = resource.monitor
    this.setValues({
      hosts: [ resource.host_id ],
      name: resource.name,
      description: resource.description,
      tags: resource.tags,
      acl: resource.acl,
      failure_severity: resource.failure_severity,
      script_id: monitor.script_id,
      script_runas: monitor.script_runas,
      script_arguments: monitor.script_arguments.join(','),
      looptime: monitor.looptime
    })
  }
})
