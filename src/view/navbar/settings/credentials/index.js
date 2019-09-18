import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import TokenActions from 'actions/token'

//import '../settings.css'

module.exports = View.extend({
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
                  <span class="glyphicon glyphicon-copy" alt="copy to clipboard"></span>
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
                  <span class="glyphicon glyphicon-copy" alt="copy to clipboard"></span>
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
                  <span class="glyphicon glyphicon-copy" alt="copy to clipboard"></span>
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
    this.listenToAndRun(App.state.navbar.settingsMenu, 'change', () => {
      this.updateState(App.state.navbar.settingsMenu)
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
        if (!this.agent)
          return
        return ( Array.isArray(this.agent.customers) && this.agent.customers.length > 0 ) ? this.agent.customers[0].name : ''
      }
    },
    agentClientId: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent)
          return
        return this.agent.client_id
      }
    },
    agentClientSecret: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent)
          return
        return this.agent.client_secret
      }
    },
  },
  bindings: {
    'agentCustomerName': [
      {
        type: 'toggle',
        hook: 'agent-set'
      },
      {
        type: 'toggle',
        hook: 'agent-not-set',
        invert: true
      },{
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
        <div data-hook="tokens-container" class="row input-row"> </div>
      </div>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      App.state.session.customer.tokens,
      TokensView,
      this.queryByHook('tokens-container'),
      {
        emptyView: NoTokens
      }
    )
  }
})

const TokensView = View.extend({
  template: `
    <div>
      <div class="col-xs-3">
        <label data-hook="username"></label>
      </div>
      <div class="input-group col-xs-9">
        <input readonly type="text" data-hook="token" class="form-control blurry-input cursor-pointer blurry-text">
        <span class="input-group-btn">
          <button class="btn btn-primary clipboard" type="button">
            <span class="glyphicon glyphicon-copy" alt="copy to clipboard"></span>
          </button>
        </span>
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
    'click .blurry-input': 'onCLickBlurry'
  },
  onCLickBlurry(event) {
    event.preventDefault()
    event.stopPropagation()
    $(event.target).toggleClass('blurry-text')
  },
})

const NoTokens = View.extend({
  template: `
    <data class="col-xs-12">
      <div>Need an Integration Access Token? <a data-hook="create" href="#">Create Token</a></div>
    </div>
  `,
  events: {
    'click a[data-hook=create]': (event) => {
      event.preventDefault()
      event.stopPropagation()
      TokenActions.create()
    }
  }
})
