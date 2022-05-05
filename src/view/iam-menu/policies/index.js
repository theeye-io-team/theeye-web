import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import Form from './form'
import PolicyRow from './policy-row'
import SimpleSwitch from 'components/simple-switch'

import './style.less'

export default View.extend({
  template: `
    <div>
      <h3 class="bold blue">Policies</h3>
      <div data-hook="test"></div>
      <div class="row">
        <div class="col-xs-6">
          <div class="policy-search">
            <i class="fa fa-search" aria-hidden="true"></i>
            <input autocomplete="off" data-hook="policy-input" class="policy-input" placeholder="Search">
          </div>
        </div>
        <div class="col-xs-3">
          <div class="toggle-container">
            <span>Show built in policies</span>
            <span data-hook="toggle"></span>
          </div>
        </div>
        <div class="col-xs-3">
          <h4 class="pull-right cursor-pointer">
            <a class="blue" data-hook="create-policy">
              <i class="fa fa-plus"></i> Create policy
            </a>
          </h4>
        </div>
      </div>
      <div class="row">
        <div class="col-xs-12">
          <div data-hook="list-container"></div>
        </div>
      </div>
    </div>
  `,
  props: {
    policySearch: ['string', false, ''],
    builtinVisible: ['boolean', true, true]
  },
  bindings: {
    policySearch: {
      type: 'value',
      hook: 'policy-input'
    }
  },
  events: {
    'click [data-hook=create-policy]': 'createPolicy',
    'input [data-hook=policy-input]': 'onSearchInput'
  },
  render () {
    this.renderWithTemplate(this)
    //this.renderSubview(
    //  new DoubleColumnSelectView({
    //    placeholder: 'aaaaa'
    //  }),
    //  this.queryByHook('test')
    //)
    this.renderCollection(
      App.state.policies,
      PolicyRow,
      this.queryByHook('list-container'),
      {}
    )
    const toggler = new SimpleSwitch({ value: this.builtinVisible })
    toggler.on('change:value', () => {
      this.builtinVisible = toggler.value
      this.filterList()
    })
    this.renderSubview(toggler, this.queryByHook('toggle'))
  },
  createPolicy () {
    const form = new Form({ model: new App.Models.Policy.Model() })
    const modal = new Modalizer({
      title: 'Create Policy',
      bodyView: form,
      buttons: true,
      confirmButton: 'Create Policy'
    })
    // this.listenTo(modal, 'shown', function () { form.focus() })
    this.listenTo(modal, 'hidden', function () {
      form.remove()
      modal.remove()
    })
    this.listenTo(modal, 'confirm', function () {
      form.beforeSubmit()
      if (!form.valid) return

      let data = form.prepareData()
      App.state.policies.create(data)
      modal.hide()
    })
    modal.show()
  },
  onSearchInput (event) {
    this.policySearch = event.target.value.toLowerCase()
    this.filterList()
  },
  filterList () {
    this._subviews[0].views.forEach(
      view => {
        view.visible = (
          view.model.name.toLowerCase().includes(this.policySearch) && 
          (this.builtinVisible || !view.model.builtin)
        )
      }
    )
  }
})
