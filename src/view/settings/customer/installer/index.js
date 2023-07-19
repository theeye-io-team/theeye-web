import View from 'ampersand-view'
import App from 'ampersand-app'
import Clipboard from 'clipboard'
import onboarding from './onboarding'
import hopscotch from 'hopscotch'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import acls from 'lib/acls'
import SelfProvidedBotView from './self-provided-bot'
import './styles.less'

import 'highlight.js/styles/github.css'
import hljs from 'highlight.js'
import bash from 'highlight.js/lib/languages/bash'
hljs.registerLanguage('bash', bash)

export default View.extend({
  initialize() {
    this.customerName = App.state.session.customer.name

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

    this.listenToAndRun(App.state.session, 'change:access_token', () => {
      this.accessToken = App.state.session.access_token
    })
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
    accessToken: 'string',
    customerName: ['string',false,''],
    agent: ['object',false,() => { return {} }]
  },
  derived:{
    linuxInstaller: {
      deps: ['agent'],
      fn () {
        if (!this.agent) { return }

        const creds = this.agent
        const downloads = this.agent.downloads

        // ensure to maintain format hereunder
        const script = `curl -s "${downloads.base_url}${downloads.linux_installer}" | bash -s \\
  "${creds.client_id}" \\
  "${creds.client_secret}" \\
  "${creds.customer_name}" \\
  "${App.config.supervisor_api_url}"`

        return script
      }
    },
    windowsInstaller: {
      deps: ['agent'],
      fn () {
        if (!this.agent) { return }
        const creds = this.agent
        const downloads = this.agent.downloads

        const script = `powershell -command "&{&"Invoke-WebRequest" -uri "${downloads.base_url}${downloads.windows_installer}" -outFile agent-installer.ps1}" && powershell.exe -ExecutionPolicy ByPass -File agent-installer.ps1 "${creds.client_id}" "${creds.client_secret}" "${creds.customer_name}" "${App.config.supervisor_api_url}"`
        return script
      }
    },
    windowsInstallerSchtask: {
      deps: ['agent'],
      fn () {
        if (!this.agent) { return }
        const creds = this.agent
        const downloads = this.agent.downloads

        const cmd = `powershell -command "&{&"Invoke-WebRequest" -uri "${downloads.base_url}${downloads.windows_schtask_installer}" -outFile agent-installer.ps1}" && powershell.exe -ExecutionPolicy ByPass -File agent-installer.ps1 "${creds.client_id}" "${creds.client_secret}" "${creds.customer_name}" "${App.config.supervisor_api_url}"`
        return cmd
      }
    },
    dockerInstaller: {
      deps: ['agent'],
      fn(){
        if (!this.agent) { return '' }
        const creds = this.agent

        const cmd = `docker run -d --name "${creds.customer_name}" -e NODE_ENV="production" \\
  -e DEBUG="*eye*err*" \\
  -e THEEYE_SUPERVISOR_CLIENT_ID="${creds.client_id}" \\
  -e THEEYE_SUPERVISOR_CLIENT_SECRET="${creds.client_secret}" \\
  -e THEEYE_SUPERVISOR_CLIENT_CUSTOMER="${creds.customer_name}" \\
  -e THEEYE_SUPERVISOR_API_URL="${App.config.supervisor_api_url}" \\
  -e THEEYE_CLIENT_HOSTNAME="${creds.customer_name}" \\
  theeye/theeye-agent`

        return cmd
      }
    },
    dockerInstallerLocalhost: {
      deps: ['agent', 'dockerInstaller'],
      fn () {
        if (!this.agent) { return '' }
        if (/localhost:60080|127.0.0.1:60080/.test(App.config.supervisor_api_url) === false) {
          return ''
        }

        // theeye is running localhost. dev or test env
        const lines = this.dockerInstaller.split("\n")
        lines.splice(1, 0, "  --add-host host.docker.internal:host-gateway \\")

        const cmd = lines
          .join("\n")
          .replace('localhost:60080', 'host.docker.internal:60080')
          .replace('127.0.0.1:60080', 'host.docker.internal:60080')

        return cmd
      }
    },
    awsInstaller: {
      deps: ['agent'],
      fn(){
        if (!this.agent) { return }
        const creds = this.agent

        const script = `#!/bin/bash
hostnamectl set-hostname ${creds.customer_name}-aws
curl -s "" | bash -s \\
  "${creds.client_id}" \\
  "${creds.client_secret}" \\
  "${creds.customer_name}" \\
  "${App.config.supervisor_api_url}"`

        return script
      }
    },
    manualExecution: {
      deps: ['agent'],
      fn () {
        if (!this.agent) { return }

        const creds = this.agent
        const downloads = this.agent.downloads

        return `THEEYE_CLIENT_HOSTNAME="${creds.customer_name}" DEBUG="*eye*" NODE_ENV="${creds.customer_name}" node .`
      }
    },
    linuxBinaryUrl: {
      deps: ['agent'],
      fn () {
        if (!this.agent) { return }

        const creds = this.agent
        const downloads = this.agent.downloads

        return `${downloads.base_url}${downloads.linux_binary}`
      }
    },
    windowsBinaryUrl: {
      deps: ['agent'],
      fn () {
        if (!this.agent) { return }

        const creds = this.agent
        const downloads = this.agent.downloads

        return `${downloads.base_url}${downloads.windows_binary}`
      }
    },
    credentialsUrl: {
      deps: ['accessToken'],
      fn () {
        return `${App.config.app_url}/api/bot/credentials?access_token=${this.accessToken}`
      }
    }
  },
  bindings: {
    credentialsUrl: {
      type: 'attribute',
      name: 'href',
      hook: 'credentials-file-download'
    },
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
    'linuxInstaller': [
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
        hook: 'linux-installer'
      }
    ],
    'manualExecution': {
      type: 'innerHTML',
      hook: 'manual-execution'
    },
    'windowsInstaller': {
      type: 'innerHTML',
      hook: 'windows-installer'
    },
    'windowsInstallerSchtask': {
      type: 'innerHTML',
      hook: 'windows-installer-schtask'
    },
    'dockerInstaller': {
      type: 'innerHTML',
      hook: 'docker-installer'
    },
    'dockerInstallerLocalhost': [
      {
        type: 'toggle',
        hook: 'docker-installer-localhost-section',
        reverse: true,
      }, {
        type: 'innerHTML',
        hook: 'docker-installer-localhost'
      }
    ],
    'awsInstaller': {
      type: 'innerHTML',
      hook: 'aws-installer'
    },
    'linuxBinaryUrl': [{
      type: 'attribute',
      name: 'href',
      hook: 'linux-binary-download'
    },{
      type: 'toggle',
      hook: 'linux-binary-download'
    }],
    'windowsBinaryUrl': [{
      type: 'attribute',
      name: 'href',
      hook: 'windows-binary-download'
    },{
      type: 'toggle',
      hook: 'windows-binary-download'
    }],
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

    new Clipboard( this.queryByHook('linux-installer-clipboard') )
    new Clipboard( this.queryByHook('manual-execution-clipboard') )
    new Clipboard( this.queryByHook('windows-installer-clipboard') )
    new Clipboard( this.queryByHook('windows-installer-schtask-clipboard') )
    new Clipboard( this.queryByHook('docker-installer-clipboard') )
    new Clipboard( this.queryByHook('docker-installer-localhost-clipboard') )
    new Clipboard( this.queryByHook('aws-installer-clipboard') )

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
  let html = `
    <div data-component="settings-installer">
      <div data-hook="agent-set">
        <autobot data-hook="autobot-placerholder"></autobot>
        <section> <!-- INSTALLER SECTION -->
          <h3 class="blue bold start-onboarding">INSTALLER</h3>
          <i class="start-onboarding" data-hook="start-onboarding"></i>
          <div id="linux-installer-onboarding" class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-linux"></i> Linux Agent</h4>
              <div class="alert" style="background:#EEEEEE">The Agent is fully funtional in Redhat/Centos 6+, Ubuntu 12+. It should works out of the box on every Linux with a kernel version 3.x+. For Linux with Kernel 2.x could require aditional actions.</div>
              <h4 class="blue">To install on Linux</h4>
              <ol>
                <li data-tutorial="linux-onboarding">Open a Console</li>
                <li data-tutorial="linux-onboarding">Become root. <i>NOTE: The installation script assumes that root access is granted.</i></li>
                <li data-tutorial="linux-onboarding">
                  Copy and paste the following line into the console to begin the installation
                    <button class="btn btn-primary container-clipboard" type="button" data-hook="linux-installer-clipboard" data-clipboard-target="#linux-installer">
                      <span class="fa fa-files-o" alt="copy to clipboard"></span>
                    </button>
                    <div
                      id="linux-installer"
                      class="bash installer-script"
                      data-hook="installer-sample linux-installer">
                    </div>
                </li>
                <li data-tutorial="linux-onboarding">Wait until Spock appears telling you are done</li>
                <li data-tutorial="linux-onboarding">Check your <a data-hook="go-to-dashboard">Dashboard<i class="fa fa-dashboard"></i></a>, you should see the installed Agent.</li>
              </ol>
            </div>
          </div>
          <div id="windows-installer-onboarding" class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-windows"></i> Windows Agent</h4>
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
                  <button class="btn btn-primary container-clipboard" type="button" data-hook="windows-installer-clipboard" data-clipboard-target="#windows-installer">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="windows-installer" class="bash installer-script" data-hook="installer-sample windows-installer"></div>
                  <span>
                    <i class="fa fa-angle-right"></i>
                    <i class="fa fa-angle-right"></i>
                    To Install the agent in your user space as a Windows scheduled task. This is recommended to run Desktop Bots and Web Bots that may need a screen
                  </span>
                  <button class="btn btn-primary container-clipboard" type="button" data-hook="windows-installer-schtask-clipboard" data-clipboard-target="#windows-installer-schtask">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="windows-installer-schtask" class="bash installer-script" data-hook="installer-sample windows-installer-schtask"></div>
                </li>
                <li data-tutorial="windows-onboarding">Wait for the installer to complete all actions.</li>
                <li data-tutorial="windows-onboarding">Check you Dashboard, you should see the host reporting.</li>
              </ol>
            </div>
          </div>
          <div id="docker-installer-onboarding" class="row border">
            <div class="col-xs-12">
              <h4 class="blue">Docker Agent</h4>
              <h4 class="blue">To launch a Docker version of the Agent</h4>
              <ol>
                <li data-tutorial="docker-onboarding">Open a Console</li>
                <li data-tutorial="docker-onboarding">Become root. <i>NOTE: The installation script assumes that root access is granted.</i></li>
                <li data-tutorial="docker-onboarding">
                  Copy and paste the following line into the console to begin the installation
                    <button class="btn btn-primary container-clipboard" data-hook="docker-installer-clipboard" type="button" data-clipboard-target="#docker-installer">
                      <span class="fa fa-files-o" alt="copy to clipboard"></span>
                    </button>
                    <div id="docker-installer" class="bash installer-script" data-hook="installer-sample docker-installer"></div>

                    <section data-hook="docker-installer-localhost-section">
                      It seems that you are running a local development or test version of TheEye.
                      Docker containers are not able to connect to the host machine without extra configuration.
                      If your are using Docker +20 you may find useful the following <code>docker run</code> command.
                      <button class="btn btn-primary container-clipboard" data-hook="docker-installer-localhost-clipboard" type="button" data-clipboard-target="#docker-installer-localhost">
                        <span class="fa fa-files-o" alt="copy to clipboard"></span>
                      </button>
                      <div id="docker-installer-localhost" class="bash installer-script" data-hook="installer-sample docker-installer-localhost"></div>
                    </section>
                </li>
                <li data-tutorial="docker-onboarding">Wait for the installer to complete all actions.</li>
                <li data-tutorial="docker-onboarding">Check your <a data-hook="go-to-dashboard">Dashboard<i class="fa fa-dashboard"></i></a>, you should see the installed Agent.</li>
              </ol>
            </div>
          </div>
          <div id="aws-installer-onboarding" class="row border">
            <div class="col-xs-12">
              <h4 class="blue">AWS ES2 user data</h4>
              <ol>
                <li data-tutorial="aws-onboarding">Open the AWS Console</li>
                <li data-tutorial="aws-onboarding">
                  Copy and paste the following user-data:
                  <button class="btn btn-primary container-clipboard" type="button" data-hook="aws-installer-clipboard" data-clipboard-target="#aws-installer">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="aws-installer" class="bash installer-script" data-hook="installer-sample aws-installer"></div>
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
              <h4 class="blue">Manual Execution</h4>
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
                    <a data-hook="credentials-file-download" download="credentials.json" target="_blank">
                      <span data-hook="customer-name"></span>
                      agent credentials file
                    </a>
                    and place it in the config directory. <br/>
                    <b>IMPORTANT!</b> You must name it <span data-hook="customer-name"></span>.json
                </li>
                <li>
                  Execute the following command
                  <button class="btn btn-primary container-clipboard"
                    type="button"
                    data-hook="manual-execution-clipboard"
                    data-clipboard-target="#manual-execution-debug">
                    <span class="fa fa-files-o" alt="copy to clipboard"></span>
                  </button>
                  <div id="manual-execution"
                    class="bash installer-script"
                    data-hook="installer-sample manual-execution">
                  </div>
                </li>
                <li>If you are debuggin the Binary replace the <code>node</code> command to <code>bin/theeye</code></li>
              </ol>
            </div>
          </div>
          <div class="row border">
            <div class="col-xs-12">
              <h4 class="blue"><i class="fa fa-download"></i> Downloads Section</h4>
              <p> <a target="_blank" href="" data-hook="linux-binary-download">Linux Binary</a> </p>
              <p> <a target="_blank" href="" data-hook="windows-binary-download">Windows Binary</a> </p>
              <p>
                <a target="_blank" data-hook="credentials-file-download">
                  <span data-hook="customer-name"></span> Agent Credentials
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
