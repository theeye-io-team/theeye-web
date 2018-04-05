import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import CopyMonitorSelect from '../copy-monitor-select'
import MonitorConstants from 'constants/monitor'
import ResourceActions from 'actions/resource'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
const HelpTexts = require('language/help')
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

import assign from 'lodash/assign'

module.exports = FormView.extend({
  initialize (options) {
    const isNewMonitor = Boolean(this.model.isNew())

    // multiple only if new, allows to create multiple tasks at once
    this.advancedFields = [
      'acl','tags','description','failure_severity'
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
      //new LooptimeSelectView({
      //  invalidClass: 'text-danger',
      //  required: true,
      //  value: this.model.monitor.looptime
      //}),
      new MonitorSelectView({
        invalidClass: 'text-danger',
        required: true,
        value: this.model.monitor.config.monitors,
        filter: (item) => {
          return item.type !== 'nested' || item.id !== this.model.id
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
      new SeveritySelectView({
        required: false,
        visible: false,
        //name: 'failure_severity',
        //label: 'Severity',
        value: this.model.failure_severity
      })
    ]

    if (isNewMonitor) {
      const copySelect = new CopyMonitorSelect({
        type: MonitorConstants.TYPE_NESTED
      })

      this.fields.unshift(copySelect)
      this.listenTo(copySelect,'change',() => {
        if (copySelect.value) {
          let monitor = App.state.resources.get(copySelect.value)
          this.setWithMonitor(monitor)
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
      this.addHelpIcon('copy_monitor')
    }
    this.addHelpIcon('name')
    this.addHelpIcon('description')
    this.addHelpIcon('tags')
    this.addHelpIcon('acl')

    const buttons = new FormButtons()
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

    // id property is the required value, with "numeric" data type

    let data = this.prepareData(this.data)
    //data.looptime = this._fieldViews.looptime.selected().id
    if (!this.model.isNew()) {
      ResourceActions.update(this.model.id, data)
    } else {
      ResourceActions.create(data)
    }

    this.trigger('submitted')
    next(null,true)
  },
  prepareData (data) {
    let f = assign({ config: {} }, data)
    f.type = MonitorConstants.TYPE_NESTED
    f.config.monitors = data.monitors
    return f
  },
  setWithMonitor (resource) {
    this.setValues({
      name: resource.name,
      description: resource.description,
      tags: resource.tags,
      monitors: resource.monitor.config.monitors
    })
  }
})
