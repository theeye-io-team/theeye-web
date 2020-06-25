import App from 'ampersand-app'
import CopyMonitorSelect from '../copy-monitor-select'
import * as MonitorConstants from 'constants/monitor'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'
//import CheckboxView from 'components/checkbox-view'
import TextareaView from 'components/input-view/textarea'
import TagsSelectView from 'view/tags-select'
import MembersSelectView from 'view/members-select'
//import LooptimeSelectView from 'view/looptime-select'
import SeveritySelectView from 'view/severity-select'
import MonitorSelectView from 'view/monitor-select'
import InputView from 'components/input-view'
import AdvancedToggle from 'view/advanced-toggle'
import FormButtons from 'view/buttons'
import MonitorFormView from '../monitor-form'

import assign from 'lodash/assign'

export default MonitorFormView.extend({
  initialize (options) {
    let resource = this.model
    let monitor = resource.monitor

    const isNewMonitor = Boolean(resource.isNew())

    // multiple only if new, allows to create multiple tasks at once
    this.advancedFields = [
      'acl','tags','description','failure_severity'
    ]

    let nestedMonitors = []
    if (monitor.monitors) {
      monitor.monitors.forEach(mon => {
        if (mon.id) {
          nestedMonitors.push(mon.id)
        } else {
          console.warn('malkformed monitors data')
        }
      })
    }

    this.fields = [
      new InputView({
        label: 'Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: resource.name,
      }),
      new MonitorSelectView({
        invalidClass: 'text-danger',
        required: true,
        value: nestedMonitors,
        optionsFilter: (item) => {
          return item.id !== resource.id
        }
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
        value: resource.description,
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
        //name: 'failure_severity',
        //label: 'Severity',
        value: resource.failure_severity
      })
    ]

    if (isNewMonitor) {
      this.advancedFields.push('copy')
      const copySelect = new CopyMonitorSelect({
        type: MonitorConstants.TYPE_NESTED,
        visible: false
      })

      this.fields.splice(3, 0, copySelect)
      this.listenTo(copySelect, 'change:value', () => {
        if (copySelect.value) {
          let resource = App.state.resources.get(copySelect.value)
          this.setWith(resource)
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
      this.addHelpIcon('copy')
    }
    this.addHelpIcon('name')
    this.addHelpIcon('monitors')
    this.addHelpIcon('description')
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
  //  if (!this.valid) {
  //    return next(null,false) // cancel submit
  //  }
  //  // id property is the required value, with "numeric" data type
  //  let data = this.prepareData(this.data)
  //  //data.looptime = this._fieldViews.looptime.selected().id
  //  if (!this.model.isNew()) {
  //    App.actions.resource.update(this.model.id, data)
  //  } else {
  //    App.actions.resource.createMany(data)
  //  }
  //  this.trigger('submitted')
  //  next(null, true)
  //},
  prepareData (data) {
    let f = data
    f.type = MonitorConstants.TYPE_NESTED
    f.monitors = data.monitors.map(m => { return { id: m } })
    return f
  },
  setWith (resource) {
    this.setValues({
      name: resource.name,
      description: resource.description,
      tags: resource.tags,
      monitors: resource.monitor.monitors,
      acl: resource.acl,
      failure_severity: resource.failure_severity
    })
  }
})
