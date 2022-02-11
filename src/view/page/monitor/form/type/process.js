import App from 'ampersand-app'
import CopyMonitorSelect from '../copy-monitor-select'
import * as MonitorConstants from 'constants/monitor'
import ResourceActions from 'actions/resource'
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
import MonitorFormView from '../monitor-form'

export default MonitorFormView.extend({
  initialize (options) {
    let resource = this.model
    let monitor = resource.monitor

    const isNewMonitor = Boolean(resource.isNew())

    this.advancedFields = [
      'description','tags','failure_severity','acl'
    ]

    let hostsSelection = new SelectView({
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

    const isRegExpCheckbox = new CheckboxView({
      label: 'Is RegExp',
      name: 'is_regexp',
      value: monitor.is_regexp
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
      isRegExpCheckbox,
      new InputView({
        label: 'Process to Search *',
        name: 'raw_search',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: monitor.raw_search,
        tests: [
          value => {
            if (!value) { return }

            if (isRegExpCheckbox.value === true) {
              try {
                new RegExp(value)
              } catch (e) {
                return 'Regular expression is not valid'
              }
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
        type: MonitorConstants.TYPE_PROCESS,
        visible: false
      })

      this.fields.splice(6, 0, copySelect)
      this.listenTo(copySelect,'change:value',() => {
        if (copySelect.value) {
          let monitor = App.state.resources.get(copySelect.value)
          this.setWithMonitor(monitor)
        }
      })
    }

    MonitorFormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
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
    this.addHelpIcon('is_regexp')
    this.addHelpIcon('raw_search')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')
    this.addHelpIcon('failure_severity')

    const buttons = new FormButtons()
    this.renderSubview(buttons)
    buttons.on('click:confirm', () => { this.submit() })
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.monitor.form[field]
      }),
      view.query('label')
    )
  },
  //submit (next) {
  //  next||(next=()=>{})

  //  this.beforeSubmit()
  //  if (!this.valid) return next(null,false) // cancel submit

  //  // id property is the required value, with "numeric" data type

  //  let data = this.prepareData(this.data)

  //  if (!this.model.isNew()) {
  //    ResourceActions.update(this.model.id, data)
  //  } else {
  //    ResourceActions.create(data)
  //  }

  //  this.trigger('submitted')
  //  next(null,true)
  //},
  prepareData (data) {
    data.type = MonitorConstants.TYPE_PROCESS
    data.looptime = this._fieldViews.looptime.selected().id
    return data
  },
  setWithMonitor (resource) {
    this.setValues({
      name: resource.name,
      description: resource.description,
      looptime: resource.monitor.looptime,
      is_regexp: resource.monitor.is_regexp,
      raw_search: resource.monitor.raw_search,
      tags: resource.tags,
      acl: resource.acl,
      failure_severity: resource.failure_severity
    })
  }
})
