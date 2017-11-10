import View from 'ampersand-view'
import App from 'ampersand-app'
import CustomerActions from 'actions/customer'
import ElasticsearchFormView from './elasticsearch-form'
import KibanaFormView from './kibana-form'

import Modalizer from 'components/modalizer'

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

    const form = new ElasticsearchFormView({ model: App.state.session.customer })

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

      CustomerActions.updateConfig(App.state.session.customer.id, {kibana: App.state.session.customer.config.kibana, elasticsearch: {enabled: form.data.elasticsearch_enabled, url:form.data.elasticsearch_url}})
      modal.hide()
    })
    modal.show()
  },
  editKibana: function (event) {
    event.stopPropagation()

    const form = new KibanaFormView({ model: App.state.session.customer })

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

      CustomerActions.updateConfig(App.state.session.customer.id, {kibana: form.data.kibana, elasticsearch: App.state.session.customer.config.elasticsearch})
      modal.hide()
    })
    modal.show()
  }
})
