import App from 'ampersand-app'
import MonitorFormView from '../monitor-form'
import HelpTexts from 'language/help'
import * as MonitorConstants from 'constants/monitor'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
import TextareaView from 'components/input-view/textarea'
import InputView from 'components/input-view'

import MembersSelectView from 'view/members-select'
import LooptimeSelectView from 'view/looptime-select'
import SeveritySelectView from 'view/severity-select'
import FormButtons from 'view/buttons'
import AdvancedToggle from 'view/advanced-toggle'
import TagsSelectView from 'view/tags-select'

export default MonitorFormView.extend({
  initialize (options) {
    let resource = this.model
    let monitor = resource.monitor

    const isNewMonitor = Boolean(resource.isNew())

    //this.advancedFields = [
    //  'description','tags','failure_severity','acl'
    //]

    this.fields = [
      new InputView({
        label: 'Hostname *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: resource.name,
        readonly: true
      }),
      //new LooptimeSelectView({
      //  invalidClass: 'text-danger',
      //  required: true,
      //  value: this.model.looptime
      //}),
      // advanced fields starts visible = false
      //new AdvancedToggle({
      //  onclick: (event) => {
      //    this.advancedFields.forEach(name => {
      //      this._fieldViews[name].toggle('visible')
      //    })
      //  }
      //}),
      new TextareaView({
        label: 'Description',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: resource.description
      }),
      new TagsSelectView({
        required: false,
        name: 'tags',
        value: resource.tags
      }),
      new MembersSelectView({
        required: false,
        name: 'acl',
        label: 'ACL\'s',
        value: resource.acl
      }),
      new SeveritySelectView({
        required: false,
        value: resource.failure_severity
      })
    ]

    MonitorFormView.prototype.initialize.apply(this, arguments)
  },
  focus () {
    this.query('input[name=name]').focus()
  },
  render () {
    MonitorFormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('name')
    this.addHelpIcon('description')
    //this.addHelpIcon('looptime')
    this.addHelpIcon('failure_severity')
    this.addHelpIcon('acl')
    this.addHelpIcon('tags')

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
  //  let data = this.prepareData(this.data)
  //  if (!this.model.isNew()) {
  //    App.actions.resource.update(this.model.id, data)
  //  } else {
  //    App.actions.resource.createMany(data)
  //  }
  //  this.trigger('submitted')
  //  next(null,true)
  //},
  prepareData (data) {
    data.type = MonitorConstants.TYPE_HOST
    //data.looptime = this._fieldViews.looptime.selected().id
    return data
  },
  setWithMonitor (resource) {
    this.setValues({
      name: resource.name,
      description: resource.description,
      //looptime: resource.looptime,
      failure_severity: resource.failure_severity,
      acl: resource.acl,
      tags: resource.tags
    })
  }
})
