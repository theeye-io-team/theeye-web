'use strict'

import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import HostGroupActions from 'actions/hostgroup'
import ConfigsView from './configs'

// input
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import HostConfigSelect from './buttons/hostconfig-select'

import HelpIcon from 'components/help-icon'
const HelpTexts = require('language/help')

export default FormView.extend({
  initialize (options) {

    this.fields = [
      new InputView({
        label: 'Template Name',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      new InputView({
        label: 'Description',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.description,
      }),
      new InputView({
        label: 'Hostname Regular Expression',
        name: 'hostname_regex',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.hostname_regex,
        tests: [
          (value) => {
            try {
              new RegExp(value)
            } catch (regexError) {
              return 'The regular expression is not valid'
            }
          }
        ]
      }),
      new SelectView({
        label: 'Hosts in this Template',
        name: 'hosts',
        multiple: true,
        tags: true,
        options: App.state.hosts,
        styles: 'form-group',
        required: false,
        value: this.model.hosts,
        unselectedText: 'select a host',
        idAttribute: 'id',
        textAttribute: 'hostname',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
    ]

    if (this.model.isNew()) {
      const hostSelect = new HostConfigSelect({
        label: 'Host to Copy',
        name: 'copy_host',
        multiple: false,
        tags: false,
        options: App.state.hosts,
        styles: 'form-group',
        required: true,
        //value: null,
        unselectedText: 'select a host',
        idAttribute: 'id',
        textAttribute: 'hostname',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
      this.fields.unshift(hostSelect)
    } else {
      App.state.hostGroupPage.configResources = this.model.resources
      App.state.hostGroupPage.configTasks = this.model.tasks

      const configs = new ConfigsView()
      configs.render()
      this.fields.unshift(configs)
    }

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
    this.addHelpIcon('hostname_regex')
    this.addHelpIcon('hosts')
    this.addHelpIcon('copy_host')
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return
    view.renderSubview(
      new HelpIcon({
        text: HelpTexts.hostgroup.form[field]
      }),
      view.query('label')
    )
  }
})
