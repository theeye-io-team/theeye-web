import View from 'ampersand-view'
import App from 'ampersand-app'
import SessionActions from 'actions/session'
import Modalizer from 'components/modalizer'

import ElasticsearchFormView from './elasticsearch-form'
import NetbrainsFormView from './netbrains-form'
import KibanaFormView from './kibana-form'
import EnterpriseLoginFormView from './enterprise-login-form'
//import Ngrok from './ngrok'
import Logger from './logger'

export default View.extend({
  template: `
    <div>
      <div data-hook="agent-set">
        <h3 class="blue bold">INTEGRATIONS</h3>
        <section data-hook="integrations-container">
    
          <div class="row border">
            <div class="col-xs-6">
              <span>Kibana</span>
            </div>
            <div class="col-xs-4">
              <span class="orange" data-hook="kibana-enabled"><a href="/admin/charts">Enabled</a></span>
              <span data-hook="kibana-disabled">Disabled</span>
            </div>
            <div class="col-xs-2">
              <div class="pull-right action-icons">
                <span><i class="fa fa-edit blue" data-hook="edit-kibana"></i></span>
              </div>
            </div>
          </div>
    
          <div class="row border">
            <div class="col-xs-6">
              <span>Elasticsearch</span>
            </div>
            <div class="col-xs-4">
              <span class="orange" data-hook="elasticsearch-enabled">Enabled</span>
              <span data-hook="elasticsearch-disabled">Disabled</span>
            </div>
            <div class="col-xs-2">
              <div class="pull-right action-icons">
                <span><i class="fa fa-edit blue" data-hook="edit-elasticsearch-url"></i></span>
              </div>
            </div>
          </div>
    
          <div class="row border">
            <div class="col-xs-6">
              <span>Netbrains</span>
            </div>
            <div class="col-xs-4">
              <span class="orange" data-hook="netbrains-enabled">Enabled</span>
              <span data-hook="netbrains-disabled">Disabled</span>
            </div>
            <div class="col-xs-2">
              <div class="pull-right action-icons">
                <span><i class="fa fa-edit blue" data-hook="edit-netbrains"></i></span>
              </div>
            </div>
          </div>

          <div class="row border">
            <div class="col-xs-6">
              <span>Enterprise Login</span>
            </div>
            <div class="col-xs-4">
              <span class="orange" data-hook="enterprise-login-enabled">Enabled</span>
              <span data-hook="enterprise-login-disabled">Disabled</span>
            </div>
            <div class="col-xs-2">
              <div class="pull-right action-icons">
                <span><i class="fa fa-edit blue" data-hook="edit-enterprise-login"></i></span>
              </div>
            </div>
          </div>
    
        </section>
      </div>
    </div>
  `,
  derived: {
    netbrainsEnabled: {
      deps: ['model.config'],
      fn () {
        let cfg = this.model.config.netbrains
        return cfg && cfg.enabled === true
      }
    },
    elasticsearchEnabled: {
      deps: ['model.config'],
      fn () {
        let cfg = this.model.config.elasticsearch
        return cfg && cfg.enabled === true
      }
    },
    kibanaEnabled: {
      deps: ['model.config'],
      fn () {
        let cfg = this.model.config.kibana
        return cfg && cfg.enabled === true
      }
    },
    enterpriseLoginEnabled: {
      deps: ['model.config'],
      fn () {
        console.log(this.model.config)
        let cfg = this.model.config.enterprise_login
        return cfg && cfg.enabled === true
      }
    }
  },
  bindings: {
    'netbrainsEnabled': [
      {
        type: 'toggle',
        hook: 'netbrains-enabled'
      }, {
        type: 'toggle',
        hook: 'netbrains-disabled',
        invert: true
      }
    ],
    'elasticsearchEnabled': [
      {
        type: 'toggle',
        hook: 'elasticsearch-enabled'
      }, {
        type: 'toggle',
        hook: 'elasticsearch-disabled',
        invert: true
      }
    ],
    'kibanaEnabled': [
      {
        type: 'toggle',
        hook: 'kibana-enabled'
      }, {
        type: 'toggle',
        hook: 'kibana-disabled',
        invert: true
      }
    ],
    'enterpriseLoginEnabled': [
      {
        type: 'toggle',
        hook: 'enterprise-login-enabled'
      }, {
        type: 'toggle',
        hook: 'enterprise-login-disabled',
        invert: true
      }
    ]
  },
  events: {
    'click [data-hook=edit-elasticsearch-url]': 'editElasticsearchUrl',
    'click [data-hook=edit-netbrains]': 'editNetbrains',
    'click [data-hook=edit-kibana]': 'editKibana',
    'click [data-hook=edit-enterprise-login]': 'editEnterpriseLogin'
  },
  editNetbrains: function (event) {
    event.stopPropagation()

    const form = new NetbrainsFormView({
      model: App.state.session.customer
    })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit netbrains url',
      bodyView: form
    })

    this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return

      let data = form.data
      SessionActions.updateCustomerIntegrations({
        integration: 'netbrains',
        config: {
          enabled: data.netbrains_enabled,
          url: data.netbrains_url
        }
      })
      modal.hide()
    })
    modal.show()
  },
  editElasticsearchUrl: function (event) {
    event.stopPropagation()

    const form = new ElasticsearchFormView({
      model: App.state.session.customer
    })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit elastichsearch url',
      bodyView: form
    })

    this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return

      let data = form.data
      SessionActions.updateCustomerIntegrations({
        integration: 'elasticsearch',
        config: {
          enabled: data.elasticsearch_enabled,
          url: data.elasticsearch_url
        }
      })
      modal.hide()
    })
    modal.show()
  },
  editKibana: function (event) {
    event.stopPropagation()

    const form = new KibanaFormView({
      model: App.state.session.customer
    })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit kibana iframe',
      bodyView: form
    })

    this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return

      SessionActions.updateCustomerIntegrations({
        integration: 'kibana',
        config: {
          enabled: form.data.kibana_enabled,
          url: form.data.kibana_url
        }
      })
      modal.hide()
    })
    modal.show()
  },
  editEnterpriseLogin: function (event) {
    event.stopPropagation()

    const form = new EnterpriseLoginFormView({
      model: App.state.session.customer
    })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit enterprise login iframe',
      bodyView: form
    })

    this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return

      SessionActions.updateCustomerIntegrations({
        integration: 'enterprise_login',
        config: {
          enabled: form.data.enterprise_login_enabled,
          url: form.data.enterprise_login_url
        }
      })
      modal.hide()
    })
    modal.show()
  },
  render () {
    this.renderWithTemplate()
    this.renderIntegrations()
  },
  renderIntegrations () {
    //const ngrok = new Ngrok()
    //this.listenToAndRun(App.state.session.customer, 'change:config', () => {
    //  ngrok.updateState(App.state.session.customer.config)
    //})
    //this.renderSubview(ngrok, this.queryByHook('integrations-container'))

    const logger = new Logger()
    this.listenToAndRun(App.state.session.customer, 'change:config', () => {
      logger.updateState(App.state.session.customer.config)
    })
    this.renderSubview(logger, this.queryByHook('integrations-container'))
  }
})
