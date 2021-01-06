import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import onboarding from './onboarding'
import hopscotch from 'hopscotch'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import acls from 'lib/acls'
import { startBot } from 'actions/integrations'
import config from 'config'

export default View.extend({
  initialize() {
    this.customerName = App.state.session.customer.name
    this.agentBinary = config.agentBinary

    this.listenToAndRun(App.state.settingsMenu.customer, 'change:agent', () => {
      this.updateState(App.state.settingsMenu.customer)
    })

    this.listenTo(
      App.state.settingsMenu.customer,
      'change:current_tab change:visible change:agent',
      () => {
        if (hopscotch.getCurrTour()) {
          hopscotch.endTour(true)
        }

        if (
          App.state.settingsMenu.customer.visible === true &&
          App.state.settingsMenu.customer.current_tab === 'installer' &&
          App.state.settingsMenu.agent !== undefined &&
          App.state.onboarding.onboardingActive
        ) {
          onboarding.start()
        }
      }
    )
  },
  updateState (state) {
    this.agent = state.agent
  },
  template () {
    return template(this)
  },
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
        if (!this.agent) { return }
        return this.agent.curl
      }
    },
    windowsCurlAgent: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.windowsCurl
      }
    },
    dockerCurlAgent: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.dockerCurl
      }
    },
    awsCurlAgent: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
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
    App.actions.settingsMenu.hide('customer')
  },
  onClickStartOnboarding() {
    onboarding.start()
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

const template = (state) => {
  const accessToken = App.state.session.access_token
  let html = `
    <div>
      <div data-hook="agent-set">
        <section > <!-- INSTALLER SECTION -->
          <h3 class="blue bold">SELF-PROVIDED BOT</h3>
          <i data-hook="start-bot-help"></i>
          <div id="self-provided-installer" class="row border">
            <div data-hook="start-bot" data-tutorial="self-provided-onboarding" class="btn btn-default col-xs-12">
              <i class="fa theeye-robot-solid" style="    bottom: 2px; position: relative;"></i>
              <a href="#">Click to start a Bot</a>
            </div>
          </div>
        </section>
        <section> <!-- INSTALLER SECTION -->
          <h3 class="blue bold start-onboarding">INSTALLER</h3>
          <i class="start-onboarding" data-hook="start-onboarding"></i>
          <div id="linux-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-linux"></i> Linux Bot Installer</h4>
              <div class="alert" style="background:#EEEEEE">The Bot is fully funtional in Redhat/Centos 6+, Ubuntu 12+. It should works out of the box on every Linux with a kernel version 3.x+. For Linux with Kernel 2.x could require aditional actions.</div>
              <h4 class="blue">To install the Bot on Linux</h4>
              <ol>
                <li data-tutorial="linux-onboarding">Open a Console</li>
                <li data-tutorial="linux-onboarding">Become root. <i>NOTE: The installation script assumes that root access is granted.</i></li>
                <li data-tutorial="linux-onboarding">
                  Copy and paste the following line into the console to begin the installation
                  <div class="input-group">
                    <input readonly type="text" id="agentCurl" class="form-control" data-hook="curl-agent">
                    <span class="input-group-btn">
                      <button class="btn btn-primary clipboard-curl-agent-btn" type="button" data-clipboard-target="#agentCurl">
                        <span class="fa fa-files-o" alt="copy to clipboard"></span>
                      </button>
                    </span>
                  </div><!-- /input-group -->
                </li>
                <li data-tutorial="linux-onboarding">Wait until Spock appears telling you are done</li>
                <li data-tutorial="linux-onboarding">Check your <a data-hook="go-to-dashboard">Dashboard<i class="fa fa-dashboard"></i></a>, you should see the installed Bot.</li>
              </ol>
            </div>
          </div>
          <div id="windows-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-windows"></i> Windows Bot Installer</h4>
              <h4 class="blue">To install the Bot on Windows</h4>
              <ol>
                <li data-tutorial="windows-onboarding">
                  Open a CMD as administrator.
                </li>
                <li data-tutorial="windows-onboarding">
                  <i>NOTE: The installation script assumes that administrator access is granted and that Powershell V5.0 or greater is installed.</i>
                </li>
                <li data-tutorial="windows-onboarding">
                  Copy and paste the following line into the console to begin the installation.
                  <div class="input-group">
                    <input readonly type="text" id="windowsAgentCurl" class="form-control" data-hook="windows-curl-agent">
                    <span class="input-group-btn">
                      <button class="btn btn-primary clipboard-windows-curl-agent-btn" type="button" data-clipboard-target="#windowsAgentCurl">
                        <span class="fa fa-files-o" alt="copy to clipboard"></span>
                      </button>
                    </span>
                  </div><!-- /input-group -->
                </li>
                <li data-tutorial="windows-onboarding">Wait for the installer to complete all actions.</li>
                <li data-tutorial="windows-onboarding">Check you Dashboard, you should see the host reporting.</li>
              </ol>
            </div>
          </div>
          <div id="docker-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue">Docker Bot Installer</h4>
              <h4 class="blue">To run a Docker version of the Bot</h4>
              <ol>
                <li data-tutorial="docker-onboarding">Open a Console</li>
                <li data-tutorial="docker-onboarding">Become root. <i>NOTE: The installation script assumes that root access is granted.</i></li>
                <li data-tutorial="docker-onboarding">
                  Copy and paste the following line into the console to begin the installation
                  <div class="input-group">
                    <input readonly type="text" id="dockerAgentCurl" class="form-control" data-hook="docker-curl-agent">
                    <span class="input-group-btn">
                      <button class="btn btn-primary clipboard-docker-curl-agent-btn" type="button" data-clipboard-target="#dockerAgentCurl">
                        <span class="fa fa-files-o" alt="copy to clipboard"></span>
                      </button>
                    </span>
                  </div><!-- /input-group -->
                </li>
                <li data-tutorial="docker-onboarding">Wait for the installer to complete all actions.</li>
                <li data-tutorial="docker-onboarding">Check your <a data-hook="go-to-dashboard">Dashboard<i class="fa fa-dashboard"></i></a>, you should see the installed Bot.</li>
              </ol>
            </div>
          </div>
          <div id="aws-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue">AWS Bot Installer</h4>
              <h4 class="blue">To install the AWS Bot</h4>
              <ol>
                <li data-tutorial="aws-onboarding">Open the AWS Console</li>
                <li data-tutorial="aws-onboarding">
                  Copy and paste the following user-data:
                  <textarea readonly id="awsAgentCurl" class="form-control" rows="4" data-hook="aws-curl-agent" style="resize: none;"></textarea>
                  <button class="btn btn-primary clipboard-aws-curl-agent-btn" type="button" data-clipboard-target="#awsAgentCurl">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                </li>
                <li data-tutorial="aws-onboarding">Launch your instances.</li>
                <li data-tutorial="aws-onboarding">Wait until the BOT starts reporting.</li>
                <li data-tutorial="aws-onboarding">Check your <a data-hook="go-to-dashboard">Dashboard<i class="fa fa-dashboard"></i></a>, you should see the installed Bot.</li>
              </ol>
            </div>
          </div>
          <div class="row border">
            <div class="col-xs-12">
              <div class="alert alert-warning">If something goes wrong, send us an email to <a href="mailto:support@theeye.io">support@theeye.io</a> indicating operating system name and version (kernel, release, distribution) and attaching the installation log file /tmp/...theEyeInstallation.log.gz</div>
            </div>
          </div>
          <div class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-download"></i> Downloads Section</h4>
              <p> <a download="theeye-agent64.tar.gz" target="_blank" href="https://s3.amazonaws.com/theeye.agent/linux/theeye-agent64.tar.gz"> Linux 64bit Binary </a> </p>
              <p> <a data-hook="agent-binary-download agent-binary-html" target="_blank"></a> </p>
              <p>
                <a download="credentials.json" target="_blank" href="/api/bot/credentials?access_token=${accessToken}">
                  <span data-hook="customer-name"></span>
                  Bot Credentials
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
      <div data-hook="agent-not-set">The Bot is unavailable. Please, contact us!</div>
    </div>
  `

  return html
}
