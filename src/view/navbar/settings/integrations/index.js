import View from 'ampersand-view'
import App from 'ampersand-app'
import SessionActions from 'actions/session'
import Modalizer from 'components/modalizer'

import ElasticsearchFormView from './elasticsearch-form'
import KibanaFormView from './kibana-form'
import Ngrok from './ngrok'

import '../settings.css'

module.exports = View.extend({
  template: require('./template.hbs'),
  derived: {
    elasticsearchEnabled: {
      deps: ['model.config'],
      fn: function(){
        return this.model.config.elasticsearch && this.model.config.elasticsearch.enabled
      }
    },
    kibanaEnabled: {
      deps: ['model.config'],
      fn: function(){
        return Boolean(this.model.config.kibana)
      }
    }
  },
  bindings: {
    'elasticsearchEnabled': [
      {
        type: 'toggle',
        hook: 'elasticsearch-enabled'
      },{
        type: 'toggle',
        hook: 'elasticsearch-disabled',
        invert: true
      }
    ],
    'kibanaEnabled': [
      {
        type: 'toggle',
        hook: 'kibana-enabled'
      },{
        type: 'toggle',
        hook: 'kibana-disabled',
        invert: true
      }
    ]
  },
  events: {
    'click [data-hook=edit-elasticsearch-url]': 'editElasticsearchUrl',
    'click [data-hook=edit-kibana]': 'editKibana'
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

    this.listenTo(modal,'shown',function(){ form.focus() })
    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) return

      let data = form.data
      SessionActions.updateCustomerIntegrations({
        elasticsearch: {
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

    this.listenTo(modal,'shown',function(){ form.focus() })
    this.listenTo(modal,'hidden',function(){
      form.remove()
      modal.remove()
    })
    this.listenTo(modal,'confirm',function(){
      form.beforeSubmit()
      if (!form.valid) return

      SessionActions.updateCustomerIntegrations({
        kibana: form.data.kibana
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
    const ngrok = new Ngrok()
    this.listenToAndRun(App.state.session.customer, 'change:config', () => {
      ngrok.updateState(App.state.session.customer.config)
    })
    this.renderSubview(ngrok, this.queryByHook('integrations-container'))
  }
})
