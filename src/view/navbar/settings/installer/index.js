import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import onboarding from './onboarding'
import hopscotch from 'hopscotch'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import NavbarActions from 'actions/navbar'
import acls from 'lib/acls'

import { startBot } from 'actions/integrations'

const config = require('config')

//import '../settings.css'

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
      },
      {
        type: 'attribute',
        name: 'value',
        hook: 'curl-agent'
      }
    ],
    'windowsCurlAgent': {
      type: 'attribute',
      name: 'value',
      hook: 'windows-curl-agent'
    },
    'dockerCurlAgent': {
      type: 'attribute',
      name: 'value',
      hook: 'docker-curl-agent'
    },
    'awsCurlAgent': {
      type: 'value',
      hook: 'aws-curl-agent'
    },
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
    windowsCurlAgent: {
      deps: ['agent'],
      fn: function(){
        if(!this.agent)
          return
        return this.agent.windowsCurl
      }
    },
    dockerCurlAgent: {
      deps: ['agent'],
      fn: function(){
        if(!this.agent)
          return
        return this.agent.dockerCurl
      }
    },
    awsCurlAgent: {
      deps: ['agent'],
      fn: function(){
        if(!this.agent)
          return
        return this.agent.awsCurl
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
    'click [data-hook=go-to-dashboard]':'onClickGoToDashboard',
    'click .start-onboarding':'onClickStartOnboarding',
    'click [data-hook=start-bot]': 'onClickStartBot'
  },
  onClickStartBot (event) {
    event.preventDefault()
    event.stopPropagation()
    if (acls.hasAccessLevel('admin')) { startBot() }
  },
  onClickGoToDashboard (event) {
    event.preventDefault()
    event.stopPropagation()
    NavbarActions.hideSettingsMenu()
  },
  onClickStartOnboarding() {
    onboarding.start()
  },
  initialize() {
    this.customerName = App.state.session.customer.name
    this.agentBinary = config.agentBinary

    this.listenToAndRun(App.state.navbar.settingsMenu,'change',() => {
      this.updateState(App.state.navbar.settingsMenu)
    })

    this.listenTo(App.state.navbar.settingsMenu,'change:current_tab change:visible change:agent',() => {
      if (hopscotch.getCurrTour()) {
        hopscotch.endTour(true)
      }
      if(App.state.navbar.settingsMenu.visible === true &&
        App.state.navbar.settingsMenu.current_tab === 'installer' &&
        App.state.onboarding.onboardingActive &&
        App.state.navbar.settingsMenu.agent !== undefined) {
          onboarding.start()
      }
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
    new Clipboard( this.query('.clipboard-windows-curl-agent-btn') )
    new Clipboard( this.query('.clipboard-docker-curl-agent-btn') )
    new Clipboard( this.query('.clipboard-aws-curl-agent-btn') )

    this.renderSubview(
      new HelpIconView({
        color: [0,77,121],
        text: HelpTexts.onboarding.installer
      }),
      this.queryByHook('start-onboarding')
    )

    this.renderSubview(
      new HelpIconView({
        color: [0,77,121],
        text: HelpTexts.settings.installer.autobot
      }),
      this.queryByHook('start-bot-help')
    )
  }
})
