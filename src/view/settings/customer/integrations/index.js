import View from 'ampersand-view'
import App from 'ampersand-app'
import SessionActions from 'actions/session'
import Modalizer from 'components/modalizer'
import DynamicForm from 'components/dynamic-form'

import * as FieldsConstants from 'constants/field'

import UrlIntegrationForm from './form/url'

const DefaultIntegrations = {
  'remote_logger': {
    label: 'Remote Logger',
    type: 'url'
  },
  'kibana': {
    label: 'Dashboard',
    type: 'url'
  },
  'elasticsearch': {
    label: 'Elasticsearch',
    type: 'url'
  },
  'netbrains': {
    label: 'Netbraings',
    type: 'url'
  },
  'enterprise_login': {
    label: 'Enterprise Login',
    type: 'url'
  }
}

export default View.extend({
  template: `
    <div>
      <div data-hook="agent-set">
        <h3 class="blue bold">INTEGRATIONS</h3>
        <section data-hook="integrations-container">
        </section>
      </div>
    </div>
  `,
  render () {
    this.renderWithTemplate()

    const integrations = Object.assign({}, DefaultIntegrations, this.model.config)

    for (let name in integrations) {
      let settings = DefaultIntegrations[name] || {}

      // extend default values
      if (this.model.config[name]) {
        settings = Object.assign(settings, this.model.config[name])
      }

      this.renderIntegration(name, settings)
    }
  },
  renderIntegration (name, settings) {
    if (!settings.label) {
      settings.label = name
    }

    const view = new IntegrationView(Object.assign({ name }, settings))
    this.renderSubview(view, this.queryByHook('integrations-container'))
  }
})

const IntegrationView = View.extend({
  initialize (settings) {
    this.settings = settings

    this.listenToAndRun(App.state.session.customer, 'change:config', () => {
      this.updateState(App.state.session.customer.config)
    })
  },
  template: `
    <div class="row border">
      <div class="col-xs-6">
        <span data-hook="label"></span>
      </div>
      <div class="col-xs-4">
        <span data-hook="enabled"></span>
      </div>
      <div class="col-xs-2">
        <div class="pull-right action-icons">
          <span><i class="fa fa-edit blue" data-hook="edit"></i></span>
        </div>
      </div>
    </div>
  `,
  props: {
    type: 'string',
    label: 'string',
    name: 'string',
    enabled: 'boolean',
    url: 'string'
  },
  derived: {
    enabledText: {
      deps: ['enabled'],
      fn () {
        return this.enabled ? 'Enabled' : 'Disabled'
      }
    }
  },
  bindings: {
    label: {
      hook: 'label'
    },
    enabled: {
      type: 'booleanClass',
      name: 'orange',
      hook: 'enabled'
    },
    enabledText: {
      hook: 'enabled'
    }
  },
  events: {
    'click [data-hook=edit]':'onClickEdit'
  },
  onClickEdit (event) {
    event.stopPropagation()

    let form
    if (this.type === 'url') {
      form = new UrlIntegrationForm({ model: this })
    } else {
      const fields = []
      for (let name in this.settings) {
        if (typeof this.settings[name] === 'boolean') {
          fields.push({
            type: FieldsConstants.TYPE_BOOLEAN,
            order: name,
            value: this.settings[name],
            label: name,
            required: false
          })
        } else {
          fields.push({
            type: FieldsConstants.TYPE_INPUT,
            order: name,
            value: this.settings[name],
            label: name,
            required: false
          })
        }
      }
      form = new DynamicForm({ fieldsDefinitions: fields })
    }

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit',
      bodyView: form
    })

    this.listenTo(modal,'shown',function(){ form.focus() })
    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) return

      let data = form.data

      const config = Object.assign(this.settings, data)

      App.actions.session.updateCustomerIntegrations({
        integration: this.name,
        config
      })
      modal.hide()
    })
    modal.show()
  },
  updateState (state = {}) {
    let settings
    if (state[this.name]) {
      settings = state[this.name]
    }

    if (!settings) { return }

    Object.assign(this, settings)
  }
})
