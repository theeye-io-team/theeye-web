import View from 'ampersand-view'
import App from 'ampersand-app'
import SessionActions from 'actions/session'
import Modalizer from 'components/modalizer'
import DynamicForm from 'components/dynamic-form'
import SimpleSwitch from 'components/simple-switch'
import { Integration } from 'models/integration'
import * as FieldsConstants from 'constants/field'
import UrlIntegrationForm from './form/url'

const DefaultIntegrations = {
  'remote_logger': {
    label: 'Remote Logger',
    type: 'url',
    name: 'remote_logger'
  },
  'kibana': {
    label: 'Dashboard',
    type: 'url',
    name: 'kibana'
  },
  'elasticsearch': {
    label: 'Elasticsearch',
    type: 'url',
    name: 'elasticsearch'
  },
  //'netbrains': {
  //  label: 'Netbrains',
  //  type: 'url',
  //  name: 'netbrains'
  //},
  'enterprise_login': {
    label: 'Enterprise Login',
    type: 'url',
    name: 'enterprise_login'
  },
  'digitize': {
    label: 'Digitize',
    name: 'digitize',
    //key: {
    //  label: 'Api Key',
    //  value: '',
    //  required: true
    //},
    enabled: false
  },
  'enterprise_components': {
    label: 'Enterprise Components',
    //name: 'enterprise_components',
    files_upload_component: {
      label: 'Uploads Component',
      value: false,
      required: false,
      type: FieldsConstants.TYPE_BOOLEAN
    },
    indicators_component: {
      label: 'Indicators Component',
      value: false,
      required: false,
      type: FieldsConstants.TYPE_BOOLEAN
    },
    files_component: {
      label: 'Files Component',
      value: false,
      required: false,
      type: FieldsConstants.TYPE_BOOLEAN
    },
    enabled: false
  }
}

export default View.extend({
  template: `
    <div>
      <div data-hook="agent-set">
        <div class="row">
          <h3 class="col-xs-2 blue bold">INTEGRATIONS</h3>
        </div>
        <section data-hook="integrations-container">
        </section>
      </div>
    </div>
  `,
  render () {
    this.renderWithTemplate()

    const config = this.model.config
    const integrations = Object.assign({}, DefaultIntegrations, config)

    for (let name in integrations) {
      let settings = Object.assign({}, DefaultIntegrations[name])
      if (!settings.name) {
        settings.name = name
      }

      // extend default values
      if (config[name]) {
        settings = Object.assign(settings, config[name])
      }

      this.renderIntegration(settings)
    }
  },
  renderIntegration (settings) {
    const integration = new Integration(settings)
    const view = new IntegrationView({ model: integration })

    this.renderSubview(view, this.queryByHook('integrations-container'))
  }
})

const IntegrationView = View.extend({
  template: `
    <div class="row border">
      <div class="col-xs-7">
        <span data-hook="label"></span>
      </div>
      <div class="col-xs-2">
        <div data-hook="enabled"></div>
      </div>
      <div class="col-xs-3">
        <div class="pull-right action-icons">
          <span><i class="fa fa-edit blue" data-hook="edit"></i></span>
        </div>
        <div class="pull-right action-icons">
          <span>
            <a href="#" data-hook="link" target="">
              <i data-hook="link-icon" class="fa fa-link"></i>
            </a>
          </span>
        </div>
      </div>
    </div>
  `,
  initialize () {
    this.listenToAndRun(App.state.session.customer, 'change:config', () => {
      this.updateState(App.state.session.customer.config)
    })
  },
  render () {
    this.renderWithTemplate()

    const btn = new SimpleSwitch({ value: this.model.enabled || false })
    btn.on('change:value', () => {

      const config = this.model.serialize()
      config.enabled = btn.value

      App.actions.session.updateCustomerIntegrations({
        integration: config.name,
        config
      })
    })  
    this.renderSubview(btn, this.queryByHook('enabled'))
    
  },
  updateState (state = {}) {
    let settings = {}
    if (state[this.model.name]) {
      settings = state[this.model.name]
    }
    this.model.set(settings)
  },
  //props: {
  //  label: 'string',
  //  enabled: 'boolean',
  //  type: 'string',
  //  name: 'string',
  //  url: 'string'
  //},
  derived: {
    //enabledText: {
    //  deps: ['model.enabled'],
    //  fn () {
    //    return this.model.enabled ? 'Enabled' : 'Disabled'
    //  }
    //},
    activeLink: {
      deps:['model.url','model.enabled'],
      fn () {
        return (this.model.url && this.model.enabled ? this.model.url : null)
      }
    },
    parsedLink: {
      deps:['model.url','model.enabled'],
      fn () {
        return (this.model.url && this.model.enabled ? this.model.url : '#')
      }
    },
    linkTarget: {
      deps:['model.url'],
      fn () {
        return (this.model.url ? '_black' : '')
      }
    }
  },
  bindings: {
    'model.label': {
      hook: 'label'
    },
    'model.enabled': {
      type: 'booleanClass',
      name: 'orange',
      hook: 'enabled'
    },
    parsedLink: {
      hook: 'link',
      type: 'attribute',
      name: 'href'
    },
    activeLink: {
      hook: 'link-icon',
      type: 'booleanClass',
      yes: 'blue',
      no: 'gray'
    },
    linkTarget: {
      hook: 'link',
      type: 'attribute',
      name: 'target'
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
    openForm(this.model)
  }
})

const openForm = (model) => {
  let form
  const settings = model.serialize()
  if (model.type === 'url') {
    form = new UrlIntegrationForm({ model })
  } else {
    const fields = []
    for (let prop in settings) {

      if (prop === 'name') {
        fields.push({
          type: FieldsConstants.TYPE_FIXED,
          order: prop,
          value: settings[prop],
          label: prop,
          required: false,
          disabled:true
        })
      } else if (typeof model[prop] === 'boolean') {
        fields.push({
          type: FieldsConstants.TYPE_BOOLEAN,
          order: prop,
          value: settings[prop],
          label: prop,
          required: false
        })
      } else {
        const sets = typeof settings[prop] !== 'string' ?
          settings[prop] :
          { value: settings[prop], label: prop }

        fields.push({
          type: (sets.type || FieldsConstants.TYPE_INPUT),
          order: prop,
          value: sets.value,
          label: sets.label,
          required: (sets.required || false)
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

  modal.on('shown',() => { form.focus() })
  modal.on('hidden',() => {
    form.remove()
    modal.remove()
  })
  modal.on('confirm',() => {
    form.beforeSubmit()
    if (!form.valid) return

    const config = Object.assign(settings, form.data)

    App.actions.session.updateCustomerIntegrations({
      integration: model.name,
      config
    })
    modal.hide()
  })
  modal.show()
}
