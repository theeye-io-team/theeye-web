import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import onboarding from './onboarding'
import hopscotch from 'hopscotch'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import acls from 'lib/acls'
import config from 'config'
import SelfProvidedBotView from './self-provided-bot'
import './styles.less'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js'
import bash from 'highlight.js/lib/languages/bash'
hljs.registerLanguage('bash', bash)

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
      () => { this.startOnboarding() }
    )

    this.listenTo(
      App.state.onboarding,
      'change:onboardingActive',
      () => { this.startOnboarding() }
    )
  },
  startOnboarding () {
    if (hopscotch.getCurrTour()) {
      hopscotch.endTour(true)
    }

    if (
      App.state.settingsMenu.customer.visible === true &&
      App.state.settingsMenu.customer.current_tab === 'installer' &&
      App.state.settingsMenu.customer.agent !== undefined &&
      App.state.onboarding.onboardingActive
    ) {
      onboarding.start()
    }
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
    //'formatedCustomerName': {
    //  type: 'text',
    //  hook: 'customer-name'
    //},
    'customerName': [
      {
        type: 'text',
        hook: 'customer-name'
      }, {
        type: 'attribute',
        name: 'download',
        hook: 'credentials-file-download'
      }
    ],
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
        type: 'innerHTML',
        hook: 'curl-agent'
      }
    ],
    'localLinux': {
      type: 'innerHTML',
      hook: 'local-linux'
    },
    'windowsCurlAgent': {
      type: 'innerHTML',
      hook: 'windows-curl-agent'
    },
    'windowsAgentSchtask': {
      type: 'innerHTML',
      hook: 'windows-agent-schtask'
    },
    'dockerAgent': {
      type: 'innerHTML',
      hook: 'docker-curl-agent'
    },
    'dockerAgentLocalhost': [
      {
        type: 'toggle',
        selector: 'section[data-hook=docker-agent-localhost]',
        reverse: true,
      }, {
        type: 'innerHTML',
        hook: 'docker-agent-localhost'
      }
    ],
    'awsCurlAgent': {
      type: 'innerHTML',
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
    windowsAgentSchtask: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.windowsSchtask
      }
    },
    dockerAgent: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.dockerCurl
      }
    },
    dockerAgentLocalhost: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        if (/localhost:60080/.test(this.agent.dockerCurl) === false) { return }

        // theeye running localhost. dev or test env
        const lines = this.agent.dockerCurl.split('\\')
        lines.splice(1, 0, `\n  --add-host host.docker.internal:host-gateway `)
        let curl = lines.join('\\')
        curl = curl.replace('localhost:60080', 'host.docker.internal:60080')
        return curl
      }
    },
    awsCurlAgent: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.awsCurl
      }
    },
    localLinux: {
      deps: ['agent'],
      fn: function(){
        if (!this.agent) { return }
        return this.agent.localLinux
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

    new Clipboard( this.queryByHook('clipboard-curl') )
    new Clipboard( this.queryByHook('clipboard-windows') )
    new Clipboard( this.queryByHook('clipboard-docker') )
    new Clipboard( this.queryByHook('clipboard-docker-localhost') )
    new Clipboard( this.queryByHook('clipboard-aws-curl') )
    new Clipboard( this.queryByHook('clipboard-local-linux') )
    new Clipboard( this.queryByHook('clipboard-curl') )

    for (let el of this.queryAll('[data-hook=installer-sample]')) {
      hljs.highlightElement(el, {language: 'bash'})
    }

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

    this.renderSelfProvidedBotsButton()
  },
  renderSelfProvidedBotsButton () {
    if (acls.hasAccessLevel('root')) {
      this.renderSubview(
        new SelfProvidedBotView(),
        this.queryByHook('autobot-placerholder')
      )
    }
  }
})

const template = (state) => {
  const accessToken = App.state.session.access_token
  let html = `
    <div data-component="settings-installer">
      <div data-hook="agent-set">
        <autobot data-hook="autobot-placerholder"></autobot>
        <section> <!-- INSTALLER SECTION -->
          <h3 class="blue bold start-onboarding">INSTALLER</h3>
          <i class="start-onboarding" data-hook="start-onboarding"></i>
          <div id="linux-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-linux"></i> Linux Installer</h4>
              <div class="alert" style="background:#EEEEEE">The Agent is fully funtional in Redhat/Centos 6+, Ubuntu 12+. It should works out of the box on every Linux with a kernel version 3.x+. For Linux with Kernel 2.x could require aditional actions.</div>
              <h4 class="blue">To install on Linux</h4>
              <ol>
                <li data-tutorial="linux-onboarding">Open a Console</li>
                <li data-tutorial="linux-onboarding">Become root. <i>NOTE: The installation script assumes that root access is granted.</i></li>
                <li data-tutorial="linux-onboarding">
                  Copy and paste the following line into the console to begin the installation
                    <button class="btn btn-primary container-clipboard" type="button" data-hook="clipboard-curl" data-clipboard-target="#agentCurl">
                      <span class="fa fa-files-o" alt="copy to clipboard"></span>
                    </button>
                    <div id="agentCurl" class="bash installer-script" data-hook="installer-sample curl-agent"></div>
                </li>
                <li data-tutorial="linux-onboarding">Wait until Spock appears telling you are done</li>
                <li data-tutorial="linux-onboarding">Check your <a data-hook="go-to-dashboard">Dashboard<i class="fa fa-dashboard"></i></a>, you should see the installed Agent.</li>
              </ol>
            </div>
          </div>
          <div id="windows-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-windows"></i> Windows Installer</h4>
              <h4 class="blue">To install on Windows</h4>
              <ol>
                <li data-tutorial="windows-onboarding">
                  Open a CMD as administrator.
                </li>
                <li data-tutorial="windows-onboarding">
                  <i>NOTE: The installation script assumes that administrator access is granted and that Powershell V5.0 or greater is installed.</i>
                <li data-tutorial="windows-onboarding">
                  Copy and paste one of the following lines into the console to begin the installation.
                </li>
                <li data-tutorial="windows-onboarding">
                  <span>For Windows there are two alternative installations:</span><br/>
                  <span>
                    <i class="fa fa-angle-right"></i>
                    <i class="fa fa-angle-right"></i>
                    To Install the agent as a background service to run background process and automations that doesn't need visual interaction
                  </span>
                  <button class="btn btn-primary container-clipboard" type="button" data-hook="clipboard-windows" data-clipboard-target="#windowsAgentCurl">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="windowsAgentCurl" class="bash installer-script" data-hook="installer-sample windows-curl-agent"></div>
                  <span>
                    <i class="fa fa-angle-right"></i>
                    <i class="fa fa-angle-right"></i>
                    To Install the agent in your user space as a Windows scheduled task. This is recommended to run Desktop Bots and Web Bots that may need a screen
                  </span>
                  <button class="btn btn-primary container-clipboard" type="button" data-hook="clipboard-windows" data-clipboard-target="#windowsAgentCurl">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="windowsAgentCurl" class="bash installer-script" data-hook="installer-sample windows-agent-schtask"></div>
                </li>
                <li data-tutorial="windows-onboarding">Wait for the installer to complete all actions.</li>
                <li data-tutorial="windows-onboarding">Check you Dashboard, you should see the host reporting.</li>
              </ol>
            </div>
          </div>
          <div id="docker-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue">Docker Installer</h4>
              <h4 class="blue">To run a Docker version of the Agent</h4>
              <ol>
                <li data-tutorial="docker-onboarding">Open a Console</li>
                <li data-tutorial="docker-onboarding">Become root. <i>NOTE: The installation script assumes that root access is granted.</i></li>
                <li data-tutorial="docker-onboarding">
                  Copy and paste the following line into the console to begin the installation
                    <button class="btn btn-primary container-clipboard" data-hook="clipboard-docker" type="button" data-clipboard-target="#dockerAgentCurl">
                      <span class="fa fa-files-o" alt="copy to clipboard"></span>
                    </button>
                    <div id="dockerAgentCurl" class="bash installer-script" data-hook="installer-sample docker-curl-agent"></div>

                    <section data-hook="docker-agent-local">
                      It seems that you are running a local development or test version of TheEye.
                      Docker containers are not able to connect to the host machine without extra configuration.
                      If your are using Docker +20 you may find useful the following <code>docker run</code> command.
                      <button class="btn btn-primary container-clipboard" data-hook="clipboard-docker-localhost" type="button" data-clipboard-target="#dockerAgentLocalhost">
                        <span class="fa fa-files-o" alt="copy to clipboard"></span>
                      </button>
                      <div id="dockerAgentLocalhost" class="bash installer-script" data-hook="installer-sample docker-agent-localhost"></div>
                    </section>
                </li>
                <li data-tutorial="docker-onboarding">Wait for the installer to complete all actions.</li>
                <li data-tutorial="docker-onboarding">Check your <a data-hook="go-to-dashboard">Dashboard<i class="fa fa-dashboard"></i></a>, you should see the installed Agent.</li>
              </ol>
            </div>
          </div>
          <div id="aws-installer" class="row border">
            <div class="col-xs-12">
              <h4 class="blue">AWS Installer</h4>
              <ol>
                <li data-tutorial="aws-onboarding">Open the AWS Console</li>
                <li data-tutorial="aws-onboarding">
                  Copy and paste the following user-data:
                  <button class="btn btn-primary container-clipboard" type="button" data-hook="clipboard-aws-curl" data-clipboard-target="#awsAgentCurl">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="awsAgentCurl" class="bash installer-script" data-hook="installer-sample aws-curl-agent"></div>
                </li>
                <li data-tutorial="aws-onboarding">Launch your instances.</li>
                <li data-tutorial="aws-onboarding">Wait until the agent starts reporting.</li>
                <li data-tutorial="aws-onboarding">Check your <a data-hook="go-to-dashboard">Home<i class="fa fa-home"></i></a>, you should see the installed Agent.</li>
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
              <h4 class="blue">Manual Execution - Linux DEBUG</h4>
              <p>This are the steps to start the Agent using the source code.
    Also if the service does not started automatically using the installation script.
    Using this method the binary can be execute manually in DEBUG mode.
    The DEBUG mode will display messages in the console that helps detect common issues</p>
              <p>Sources for the latest version can be downloaded from <a href="https://github.com/theeye-io-team/theeye-agent">GitHub</a> </p>
              <p>For more details about running from source code, read the <a href="https://documentation.theeye.io/theeye-agent/#/sources_install">docs</a></p>
              <ol>
                <li>Change directory to the installation path. For example, the installation script uses /opt/theeye </li>
                <li>
                    Download the
                    <a data-hook="credentials-file-download" download="credentials.json" target="_blank" href="/api/bot/credentials?access_token=${accessToken}">
                      <span data-hook="customer-name"></span>
                      agent credentials file
                    </a>
                    and place it in the config directory. <br/>
                    <b>IMPORTANT!</b> You must name it <span data-hook="customer-name"></span>.json
                </li>
                <li>
                  Execute the following command
                  <button class="btn btn-primary container-clipboard" type="button" data-hook="clipboard-local-linux" data-clipboard-target="#local-linux">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="local-linux" class="bash installer-script" data-hook="installer-sample local-linux"></div>
                </li>
                <li>If you are debuggin the Binary use the command <code>bin/theeye</code> instead</li>
              </ol>
            </div>
          </div>
          <div class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-download"></i> Downloads Section</h4>
              <p> <a download="theeye-agent-linux.tar.gz" target="_blank" href="https://theeye-agent.s3.amazonaws.com/linux/theeye-agent64.tar.gz">Linux Binary</a> </p>
              <p> <a download="theeye-agent-windows.zip" target="_blank" href="https://theeye-agent.s3.amazonaws.com/windows/theeye-agent.zip">Windows Binary</a> </p>
              <p>
                <a data-hook="credentials-file-download" target="_blank" href="/api/bot/credentials?access_token=${accessToken}">
                  <span data-hook="customer-name"></span>
                  Agent Credentials
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
      <div data-hook="agent-not-set">The Agent is unavailable. Please, contact us!</div>
    </div>
  `

  return html
}
