import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import NgrokForm from './form'
import SessionActions from 'actions/session'

export default View.extend({
  template: `
    <div class="row border">
      <div class="col-xs-6">
        <span>ngrok</span>
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
    address: 'string',
    authtoken: 'string',
    protocol: 'string'
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

    const form = new NgrokForm({ model: this })

    const modal = new Modalizer({
      confirmButton: 'Save',
      buttons: true,
      title: 'Edit Ngrok Integration',
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
        integration: 'ngrok',
        config: {
          enabled: data.enabled,
          address: data.address,
          authtoken: data.authtoken,
          protocol: data.protocol
        }
      })
      modal.hide()
    })
    modal.show()
  },
  updateState (state) {
    let ngrok = state.ngrok
    if (!ngrok) return

    this.enabled = ngrok.enabled
    this.address = ngrok.address
    this.authtoken = ngrok.authtoken
    this.protocol = ngrok.protocol
  }
})
