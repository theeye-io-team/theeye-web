'use strict'

import assign from 'lodash/assign'
import App from 'ampersand-app'
import FormView from 'ampersand-form-view'
import View from 'ampersand-view'
import HostGroupActions from 'actions/hostgroup'
import ConfigsView from './configs'
import HostConfigSelect from './buttons/hostconfig-select'
import Modalizer from 'components/modalizer'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'
const HelpTexts = require('language/help')

var currentGroup

/**
 *
 * @param {Host} hostModel
 *
 */
const addHostToGroup = (hostModel) => {
  currentGroup.hosts.add(hostModel)
}

const RegexInputView = InputView.extend({
  template: `
    <div>
      <label class="col-sm-3 control-label" data-hook="label"></label>
      <div class="col-sm-9">
        <div class="input-group">
          <input class="form-control form-input">
          <span class="input-group-btn">
            <button data-hook="search-by-regexp" class="btn btn-default" type="button">Search...</button>
          </span>
        </div>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
    </div>
  `,
  derived: {
    searchable: {
      deps: ['value','valid'],
      fn () {
        return this.value && this.valid && this.inputValue.length > 3
      }
    }
  },
  bindings: assign({}, InputView.prototype.bindings, {
    searchable: {
      type: 'booleanAttribute',
      hook: 'search-by-regexp',
      name: 'disabled',
      invert: true
    }
  }),
  events: {
    'click button[data-hook=search-by-regexp]': 'onClickSearchHostsButton'
  },
  onClickSearchHostsButton (event) {
    event.preventDefault()
    event.stopPropagation()
    if (!this.searchable) return

    HostGroupActions.searchHostsByRegex(this.value)
  }
})

const ItemView = View.extend({
  template: `
    <li style="list-style-type:none; border-bottom: 1px solid #dadada; padding: 10px">
      <span></span>
      <a data-hook="" href="#">
        <i class="fa fa-plus" style="float:right; position:relative; top: 4px; "></i>
      </a>
    </li>`,
  bindings: {
    'model.hostname': {
      selector: 'span'
    }
  },
  events: {
    'click a':'onClickButton',
  },
  onClickButton (event) {
    //this.trigger('clicked',event)
    addHostToGroup(this.model)
  }
})

const HostsListView = View.extend({
  props: {
    hosts: 'collection',
    massiveAddButton: ['boolean',false,false]
  },
  template: `
    <div>
      <div>${HelpTexts.hostgroup.regexp_search}</div>
      <div data-hook="items" class="items" style="border-top: 1px solid #eee; margin-top: 15px;">
      </div>
      <div data-hook="massive-add-container">
        <li style="list-style-type:none; padding: 10px;background-color: #eee;">
          <a data-hook="massive-add" href="#" style="height:20px;">
            <b>Add All</b>
            <i class="fa fa-plus" style="float:right; position:relative; top: 4px; right:8px;"></i>
          </a>
        </li>
      </div>
    </div>
  `,
  initialize (options) {
    View.prototype.initialize.apply(this,arguments)

    this.listenTo(this.collection,'sync',function(){
      this.massiveAddButton = ! Boolean(this.collection.length === 0)
    })
  },
  events: {
    'click a[data-hook=massive-add]':'onClickMassiveAddButton',
  },
  onClickMassiveAddButton () {
    this.collection.forEach((model) => {
      addHostToGroup(model)
    })
    this.trigger('click:add_all')
  },
  bindings: {
    massiveAddButton: {
      type: 'toggle',
      hook: 'massive-add-container'
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      this.collection,
      ItemView,
      this.queryByHook('items')
    )
  }
})

const HostsPreviewModal = Modalizer.extend({
  initialize (options) {
    Modalizer.prototype.initialize.apply(this, arguments)

    this.fade = options.fade || true
    this.visible = options.visible || false // like auto open
    this.title = options.title || 'Hosts matching the Regular Expression'
    this.class = 'hosts-list-modal'

    this.list = new HostsListView({
      collection: App.state.hostsByRegex,
      hosts: this.model.hosts
    })

    this.bodyView = this.list

    this.listenTo(App.state.hostsByRegex, 'sync', () => {
      this.show()
    })

    this.listenTo(this.list, 'click:add_all', () => {
      this.hide()
    })

    //this.listenTo(this,'hidden',() => {
    //  this.list.remove()
    //  delete this.list
    //})
  }
})

module.exports = FormView.extend({
  initialize (options) {

    currentGroup = this.model

    const regexInput = new RegexInputView({
      label: 'Hostname Regular Expression',
      name: 'hostname_regex',
      required: false,
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label',
      value: this.model.hostname_regex,
      placeholder: '^hostname$',
      tests: [
        (value) => {
          try {
            new RegExp(value)
          } catch (regexError) {
            return 'The regular expression is not valid'
          }
        }
      ],
    })

    const selectedHosts = new SelectView({
      label: 'Hosts to add to the Template',
      name: 'hosts',
      multiple: true,
      tags: true,
      options: App.state.hosts,
      value: this.model.hosts,
      styles: 'form-group',
      required: false,
      unselectedText: 'select a host',
      idAttribute: 'id',
      textAttribute: 'hostname',
      requiredMessage: 'Selection required',
      invalidClass: 'text-danger',
      validityClassSelector: '.control-label'
    })

    selectedHosts.listenTo(this.model.hosts, 'add', () => {
      selectedHosts.setValues(this.model.hosts)
    })

    this.fields = [
      new InputView({
        label: 'Template Name *',
        name: 'name',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.name,
      }),
      regexInput,
      selectedHosts,
      new InputView({
        label: 'Description',
        name: 'description',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.description,
      }),
    ]

    if (this.model.isNew()) {
      const hostSelect = new HostConfigSelect({
        label: 'Template base Host *',
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
        validityClassSelector: '.control-label',
        tests: [
          () => {
            const noConfig = (
              App.state.hostGroupPage.configResources.length === 0 &&
              App.state.hostGroupPage.configTasks.length === 0 &&
              App.state.hostGroupPage.configTriggers.length === 0
            )

            if (noConfig) {
              return 'Configuration is required. We need something to create a template'
            }
          }
        ]
      })
      this.fields.unshift(hostSelect)
    } else {
      App.state.hostGroupPage.configResources = this.model.resources
      App.state.hostGroupPage.configTasks = this.model.tasks
      App.state.hostGroupPage.configTriggers = this.model.triggers

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

    this.previewModal = new HostsPreviewModal({
      model: this.model // contains the collection of hosts
    })

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
  },
  remove () {
    FormView.prototype.remove.apply(this)
    this.previewModal.remove()
  }
})
