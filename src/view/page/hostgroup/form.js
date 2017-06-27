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
      deps: ['value', 'valid'],
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
    <a href="#">
      <i class="fa fa-plus" style="float:right; position:relative; top: 4px; "></i>
    </a>
  </li>`,
  bindings: {
    'model.hostname': {
      selector: 'span'
    }
  },
  events: {
    'click a':'onClickButton'
  },
  onClickButton (event) {
    //this.trigger('clicked',event)
    currentGroup.hosts.add( this.model )
  }
})

const HostsListView = View.extend({
  props: {
    hosts:'collection'
  },
  template: `<div data-hook="items"></div>`,
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      this.collection,
      //ItemView,
      (options) => {
        const view = new ItemView(options)
        this.listenTo(view,'clicked', (event) => {
          console.log('click')
          console.log(options.model)
        })
        return view
      },
      this.queryByHook('items')
    )
  }
})

const HostsPreviewModal = Modalizer.extend({
  initialize (options) {
    Modalizer.prototype.initialize.apply(this, arguments)

    this.fade = options.fade || true
    this.visible = options.visible || false // like auto open
    this.title = options.title || 'Hosts matching Regular Expression'
    this.content = null
    this.class = 'hosts-list-modal'

    this.content = new HostsListView({
      collection: App.state.hostsByRegex,
      hosts: this.model.hosts
    })

    this.bodyView = this.content

    this.listenTo(App.state.hostsByRegex, 'sync', () => {
      this.show()
    })

    //this.listenTo(this,'hidden',() => {
    //  this.content.remove()
    //  delete this.content
    //})
  }
})

export default FormView.extend({
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

    selectedHosts.listenTo(this.model.hosts, 'add', () => {
      selectedHosts.setValues(this.model.hosts)
    })

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
      regexInput,
      selectedHosts
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
