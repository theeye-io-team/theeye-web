import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import IntegrationForm from './form'

export default View.extend({
  template: `
    <div class="row border">
      <div class="col-xs-6">
        <span>Remote Logger</span>
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

    const form = new IntegrationForm({ model: this })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit Integration',
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
      App.actions.session.updateCustomerIntegrations({
        integration: 'remote_logger',
        config: {
          enabled: data.enabled,
          url: data.url
        }
      })
      modal.hide()
    })
    modal.show()
  },
  updateState (state) {
    let rlogger = state.remote_logger
    if (!rlogger) return

    this.enabled = rlogger.enabled
    this.url = rlogger.url
  }
})
