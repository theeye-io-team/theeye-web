import View from 'ampersand-view'
import App from 'ampersand-app'
import SessionActions from 'actions/session'
import Modalizer from 'components/modalizer'

import ElasticsearchFormView from './elasticsearch-form'
import NetbrainsFormView from './netbrains-form'
import KibanaFormView from './kibana-form'
//import Ngrok from './ngrok'

module.exports = View.extend({
  template: require('./template.hbs'),
  derived: {
    netbrainsEnabled: {
      deps: ['model.config'],
      fn: function () {
        return this.model.config.netbrains && this.model.config.netbrains.enabled
      }
    },
    elasticsearchEnabled: {
      deps: ['model.config'],
      fn: function () {
        return this.model.config.elasticsearch && this.model.config.elasticsearch.enabled
      }
    },
    kibanaEnabled: {
      deps: ['model.config'],
      fn: function () {
        return this.model.config.kibana && this.model.config.kibana.enabled
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
    ]
  },
  events: {
    'click [data-hook=edit-elasticsearch-url]': 'editElasticsearchUrl',
    'click [data-hook=edit-netbrains]': 'editNetbrains',
    'click [data-hook=edit-kibana]': 'editKibana'
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
  }
})
