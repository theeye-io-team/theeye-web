import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import NavbarActions from 'actions/navbar'

const config = require('config')

import '../settings.css'


module.exports = View.extend({
  template: require('./template.hbs'),
  props: {
    customerName: ['string',false,''],
    agentBinary: ['object',false,() => { return {} }],
    agent: ['object',false,() => { return {} }]
  },
  bindings: {
    'formatedCustomerName': {
      type: 'text',
      hook: 'customer-name'
    },
    'curlAgent': [
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
        hook: 'curl-agent'
      }
    ],
    'agentBinaryUrl': {
      type: 'attribute',
      name: 'href',
      hook: 'agent-binary-download'
    },
    'agentBinaryName': {
      type: 'attribute',
      name: 'download',
      hook: 'agent-binary-download'
    },
    'agentBinaryHTML': {
      type: 'innerHTML',
      hook: 'agent-binary-html'
    },
    'agentBinaryRoute': {
      type: 'innerHTML',
      hook: 'agent-binary-route'
    }
  },
  derived:{
    formatedCustomerName: {
      deps: ['customerName'],
      fn: function(){
        if(this.customerName && this.customerName.length)
          return this.customerName[0].toUpperCase() + this.customerName.slice(1,this.customerName.length)
        return ''
      }
    },
    curlAgent: {
      deps: ['agent'],
      fn: function(){
        if(!this.agent)
          return
        return this.agent.curl
      }
    },
    agentBinaryUrl : {
      deps: ['agentBinary'],
      fn: function() {
        return this.agentBinary.url
      }
    },
    agentBinaryName : {
      deps: ['agentBinary'],
      fn: function() {
        return this.agentBinary.name
      }
    },
    agentBinaryHTML : {
      deps: ['agentBinary'],
      fn: function() {
        return this.agentBinary.name+'<i class="fa fa-download"></i>'
      }
    },
    agentBinaryRoute : {
      deps: ['agentBinary'],
      fn: function() {
        return "./"+this.agentBinary.name
      }
    }
  },
  events: {
    'click [data-hook=go-to-dashboard]':'onClickGoToDashboard'
  },
  onClickGoToDashboard (event) {
    event.preventDefault()
    event.stopPropagation()

    NavbarActions.hideSettingsMenu()
  },
  initialize() {
    this.customerName = App.state.session.customer.name
    this.agentBinary = config.agentBinary

    this.listenToAndRun(App.state.navbar.settingsMenu,'change',() => {
      this.updateState(App.state.navbar.settingsMenu)
    })
  },
  updateState(state) {
    this.agent = state.agent
  },
  render() {
    this.renderWithTemplate(this)
    this.listenToAndRun(App.state.session.customer,'change:name', () => {
       this.customerName = App.state.session.customer.name
    })
    new Clipboard( this.query('.clipboard-curl-agent-btn') )
  }
})
