import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import Modalizer from 'components/modalizer'
import TokenForm from './tokenForm'
import TokenActions from 'actions/token'
import { Model as TokenModel } from 'models/token'
import bootbox from 'bootbox'

export default View.extend({
  template: `<div></div>`,
  render () {
    this.renderWithTemplate(this)

    this.renderSubview(new AgentPanel(), this.el)
    this.renderSubview(new CustomerTokensPanel(), this.el)
  }
})

const AgentPanel = View.extend({
  template: `
    <div data-hook="agent-set">
      <h3 class="blue bold">CREDENTIALS</h3>
      <div class="row border">
        <div class="col-xs-12">
          <h4 class="blue"><i class="fa theeye-robot-solid"></i> Bot Credentials</h4>
          <div class="row input-row">
            <div class="col-xs-3"><label>Customer</label></div>
            <div class="input-group col-xs-9">
              <input readonly type="text" id="customerName" class="form-control" data-hook="agent-customer-name">
              <span class="input-group-btn">
                <button class="btn btn-primary clipboard-customer-name-btn" type="button" data-clipboard-target="#customerName">
                  <span class="fa fa-files-o" alt="copy to clipboard"></span>
                </button>
              </span>
            </div>
          </div>
          <div class="row input-row">
            <div class="col-xs-3"><label>Client ID</label></div>
            <div class="input-group col-xs-9">
              <input readonly type="text" id="clientId" class="form-control" data-hook="agent-client-id">
              <span class="input-group-btn">
                <button class="btn btn-primary clipboard-client-id-btn" type="button" data-clipboard-target="#clientId">
                  <span class="fa fa-files-o" alt="copy to clipboard"></span>
                </button>
              </span>
            </div>
          </div>
          <div class="row input-row">
            <div class="col-xs-3"><label>Client Secret</label></div>
            <div class="input-group col-xs-9">
              <input readonly type="text" id="clientSecret" class="form-control blurry-input cursor-pointer blurry-text" data-hook="agent-client-secret">
              <span class="input-group-btn">
                <button class="btn btn-primary clipboard-client-secret-btn" type="button" data-clipboard-target="#clientSecret">
                  <span class="fa fa-files-o" alt="copy to clipboard"></span>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div data-hook="agent-not-set">The Bot is unavailable. Please, contact us!</div>
    </div>
  `,
  initialize() {
    this.listenToAndRun(App.state.settingsMenu.customer, 'change', () => {
      this.updateState(App.state.settingsMenu.customer)
    })
  },
  events: {
    'click .blurry-input': 'onCLickBlurry'
  },
  onCLickBlurry(event) {
    event.preventDefault()
    event.stopPropagation()
    $( event.target ).toggleClass('blurry-text');
  },
  updateState(state) {
    this.agent = state.agent
  },
  props: {
    agent: ['object',false,() => { return {} }]
  },
  derived:{
    agentCustomerName: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.customer_name
      }
    },
    agentClientId: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.client_id
      }
    },
    agentClientSecret: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.client_secret
      }
    },
  },
  bindings: {
    'agentCustomerName': [
      {
        type: 'toggle',
        hook: 'agent-set'
      }, {
        type: 'toggle',
        hook: 'agent-not-set',
        invert: true
      }, {
        type: 'attribute',
        name: 'value',
        hook: 'agent-customer-name'
      }
    ],
    'agentClientId': {
      type: 'attribute',
      name: 'value',
      hook: 'agent-client-id'
    },
    'agentClientSecret': {
      type: 'attribute',
      name: 'value',
      hook: 'agent-client-secret'
    }
  },
  render() {
    this.renderWithTemplate(this)

    new Clipboard( this.query('.clipboard-customer-name-btn') )
    new Clipboard( this.query('.clipboard-client-id-btn') )
    new Clipboard( this.query('.clipboard-client-secret-btn') )
  }
})

const CustomerTokensPanel = View.extend({
  template: `
    <div class="row border">
      <div class="col-xs-12">
        <h4 class="blue"><i class="fa fa-lock"></i> Integration Tokens</h4>
        <div class="row">
          <div class="col-xs-12">
            <div>Need an Integration Access Token? <a data-hook="create" href="#">Create Token</a></div>
          </div>
        </div>
        </br>
        <div  class="row input-row">
          <div class="col-xs-12" data-hook="tokens-container"></div>
        </div>
      </div>
    </div>
  `,
  events: {
    'click a[data-hook=create]':'onClickCreate'
  },
  onClickCreate (event) {
    event.preventDefault()
    event.stopPropagation()


    const form = new TokenForm({ model: new TokenModel() })

    const modal = new Modalizer({
      confirmButton: 'Create',
      buttons: true,
      title: 'Create new integration token',
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
      TokenActions.create(data)
      modal.hide()
    })
    modal.show()
  },
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      App.state.session.customer.tokens,
      TokensView,
      this.queryByHook('tokens-container')
    )
  }
})

const TokensView = View.extend({
  template: `
    <div class="row">
      <div class="col-xs-3">
        <label data-hook="username"style="overflow:hidden;text-overflow:ellipsis;"></label>
      </div>
      <div class="input-group col-xs-8" style="float:left">
        <input readonly type="text" data-hook="token" class="form-control blurry-input cursor-pointer blurry-text">
        <span class="input-group-btn">
          <button class="btn btn-primary clipboard" type="button">
            <span class="fa fa-files-o" alt="copy to clipboard"></span>
          </button>
        </span>
      </div>
      <div class="col-xs-1">
        <div data-hook="member-icons" class="pull-right action-icons">
          <span style="display:none;"><i class="fa fa-edit blue" data-hook="edit-token"></i></span>
          <span><i class="fa fa-times blue" data-hook="remove-token"></i></span>
        </div>
      </div>
    </div>
  `,
  bindings: {
    'model.username': { hook: 'username' },
    'model.token': {
      type: 'attribute',
      name: 'value',
      hook: 'token'
    }
  },
  render () {
    this.renderWithTemplate(this)
    this.clipboard = new Clipboard(
      this.query('button'),
      {
        text: (trigger) => this.model.token
      }
    )
  },
  remove () {
    this.clipboard.destroy()
    View.prototype.remove.apply(this, arguments)
  },
  events: {
    'click .blurry-input': 'onCLickBlurry',
    'click [data-hook=remove-token]': 'removeToken',
    'click [data-hook=edit-token]': 'editToken'
  },
  removeToken (event) {
    event.preventDefault()
    event.stopPropagation()
    bootbox.confirm(`Delete integration token: ${this.model.username}`,
      (confirmed) => {
        if (!confirmed) { return }
        TokenActions.remove(this.model.id)
      }
    )
  },
  editToken (event) {
    // to do
  },
  onCLickBlurry(event) {
    event.preventDefault()
    event.stopPropagation()
    $(event.target).toggleClass('blurry-text')
  },
})
