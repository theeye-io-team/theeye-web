import App from 'ampersand-app'
import SelectView from 'components/select2-view'
import Modalizer from 'components/modalizer'
import PolicyForm from './policies/form'

export default SelectView.extend({
  template: `
    <div>
      <div>
        <label data-hook="label" class="col-sm-3 control-label"></label>
        <div class="col-sm-6">
          <select class="form-control select" style="width:100%"></select>
          <div data-hook="message-container" class="message message-below message-error">
            <p data-hook="message-text"></p>
          </div>
        </div>
      </div>
      <div class="col-sm-3">
        <button data-hook="create-button" class="btn btn-block btn-primary">Create a policy</button>
      </div>
    </div>
  `,
  initialize (specs) {
    this.options = App.state.policies.models
    this.multiple = true
    this.tags = false
    this.label = 'Policy Selection'
    this.name = 'policies'
    this.styles = 'form-group'
    this.unselectedText = 'select a policy'
    this.idAttribute = 'id'
    this.textAttribute = 'name'
    this.allowCreateTags = false
    this.required = specs?.required || false

    SelectView.prototype.initialize.apply(this, arguments)
  },
  events: {
    'click button[data-hook=create-button]':'onClickCreateButton'
  },
  onClickCreateButton (event) {
    event.preventDefault()
    event.stopPropagation()

    const policyForm = new PolicyForm({ model: new App.Models.Policy.Model() })
    const policyModal = new Modalizer({
      title: 'Create Policy',
      bodyView: policyForm,
      buttons: true,
      confirmButton: 'Create Policy'
    })
    // this.listenTo(policyModal, 'shown', function () { policyForm.focus() })
    this.listenTo(policyModal, 'hidden', function () {
      policyForm.remove()
      policyModal.remove()
    })
    this.listenTo(policyModal, 'confirm', function () {
      policyForm.beforeSubmit()
      if (!policyForm.valid) return

      let data = policyForm.prepareData()
      App.state.policies.create(data)
      policyModal.hide()
    })
    
    policyModal.show()
  },
  derived: {
    value: {
      deps: ['inputValue','multiple'],
      fn: function () {
        // this is set with $select2 data array value
        // it contains id and text attributes
        let input = this.inputValue
        if (this.multiple) {
          if (!input) return []
          if (Array.isArray(input)&&input.length===0) return []
          return input.map(e => App.state.policies.get(e.id).serialize())
        } else {
          if (!input) return null
          if (Array.isArray(input)&&input.length===0) return null
          let values = input.map(e => App.state.policies.get(e.id).serialize())
          return values[0]
        }
      }
    }
  }
})
