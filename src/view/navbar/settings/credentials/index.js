import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'

import '../settings.css'

module.exports = View.extend({
  template: require('./template.hbs'),
  props: {
    agent: ['object',false,() => { return {} }],
    passports: ['object',false,() => { return {} }]
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
    },
    'theeyeToken': {
      type: 'attribute',
      name: 'value',
      hook: 'theeye-token'
    }
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
    theeyeToken: {
      deps: ['passports'],
      fn: function(){
        if (!this.passports)
          return
        return this.passports.theeye.token
      }
    }
  },
  events: {
    'click .blurry-input': 'onCLickBlurry'
  },
  onCLickBlurry(event) {
    event.preventDefault()
    event.stopPropagation()
    $( event.target ).toggleClass('blurry-text');
  },
  initialize() {
    this.listenToAndRun(App.state.navbar.settingsMenu,'change',() => {
      this.updateState(App.state.navbar.settingsMenu)
    })
  },
  updateState(state) {
    this.agent = state.agent
    this.passports = state.passports
  },
  render() {
    this.renderWithTemplate(this)

    new Clipboard( this.query('.clipboard-customer-name-btn') )
    new Clipboard( this.query('.clipboard-client-id-btn') )
    new Clipboard( this.query('.clipboard-client-secret-btn') )
    new Clipboard( this.query('.clipboard-token-btn') )
  }
})
