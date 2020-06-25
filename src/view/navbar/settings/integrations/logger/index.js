import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import Form from './form'
import SessionActions from 'actions/session'

export default View.extend({
  template: `
    <div class="row border">
      <div class="col-xs-6">
        <span data-hook="title"></span>
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
    name: ['string', false, 'remote_logger']
  },
  derived: {
    enabledText: {
      deps: ['enabled'],
      fn () {
        return this.enabled ? 'Enabled' : 'Disabled'
      }
    },
    title: {
      deps: ['name'],
      fn () {
        let name = this.name.replace('_',' ')
        return name.charAt(0).toUpperCase() + name.slice(1)
      }
    }
  },
  bindings: {
    title: { hook: 'title' },
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

    const form = new Form({ model: this })

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
      if (!form.valid) { return }

      let data = form.data
      SessionActions.updateCustomerIntegrations({
        integration: this.name,
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
    let data = state[this.name]
    if (!data) return

    this.enabled = data.enabled
    this.url = data.url
  }
})
