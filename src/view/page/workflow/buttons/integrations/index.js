import App from 'ampersand-app'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import $ from 'jquery'
import View from 'ampersand-view'
import './style.less'
import 'highlight.js/styles/github.css'
import Clipboard from 'clipboard'
import config from 'config'
import Titles from 'language/titles'
import qs from 'qs'

import hljs from 'highlight.js'
import bash from 'highlight.js/lib/languages/bash'
hljs.registerLanguage('bash', bash)

const docsLink = ''

export default PanelButton.extend({
  initialize (options) {
    this.title = Titles.workflow.buttons.integrations
    this.iconClass = 'fa fa-chain dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      let view = new CredentialsView({ model: this.model })

      const modal = new Modalizer({
        buttons: false,
        title: this.title,
        bodyView: view
      })

      this.listenTo(modal, 'hidden', () => {
        view.remove()
        modal.remove()
      })

      modal.show()

      App.actions.workflow.getCredentials(this.model.id)
    }
  }
})

const CredentialsView = View.extend({
  template: `
    <div data-component="wf-credentials">
			<div class="form-group">
		  	<label>Integration ID (Workflow ID)</label>
        <div class="input-group">
      	  <input class="form-control form-input " id="integrationId" readonly type="text" data-hook="id" value="">
          <span class="input-group-btn">
            <button class="btn btn-primary" type="button" data-hook="copy_id">
              <span class="fa fa-copy" alt="copy to clipboard"></span>
            </button>
          </span>
			  </div>
			</div>
			<div class="form-group">
		  	<label>Integration Secret</label>
        <div class="input-group">
      	  <input class="form-control form-input " id="integrationSecret" readonly type="text" data-hook="secret" value="">
          <span class="input-group-btn">
            <button class="btn btn-primary" type="button" data-hook="copy_secret">
              <span class="fa fa-copy" alt="copy to clipboard"></span>
            </button>
          </span>
			  </div>
			</div>
			<div class="form-group">
		  	<label>Full URL</label>
        <div class="input-group">
      	  <input class="form-control form-input" id="api_url" readonly type="text" data-hook="api_url" value="">

          <!--<span class="input-group-btn">
            <button class="btn btn-default" style="border-radius:0;" data-hook="sync-toggle">
              <label style="margin: 0px;" >Async</label>
            </button>
          </span>-->

          <span class="input-group-btn">
            <button class="btn btn-default" style="border-radius:0;" data-hook="secret-toggle">
              <label style="margin: 0px;" >Secret</label>
            </button>
          </span>

          <span class="input-group-btn">
            <button class="btn btn-primary" type="button" data-hook="copy_url">
              <span class="fa fa-copy" alt="copy to clipboard"></span>
            </button>
          </span>
			  </div>
			</div>
      <div class="form-group">
        <ul class="nav nav-pills" href="javascript:void(0)">
          <li role="presentation" class="active">
            <a style="cursor:pointer;padding: 7px 15px;"
              data-hook="toggle-trigger"
              href="#">
              Shell Curl
            </a>
          </li>
        </ul>

        <div class="hidden-data form-group" data-hook="toggle-target">
          <label>curl sample using unix shell</label>
          <pre data-hook="sample-code">
            <code class="bash">
<span data-hook="args-vars"></span>

curl -i -sS -X POST '<span data-hook="curl_api_url"></span>' \\
  --header 'Content-Type: application/json' \\
  --data '{"task_arguments":[<span data-hook="task_args"></span>]}'
           </code>
          </pre>
          <a href="${config.docs}/${docsLink}" target="_blank">Find more info in the docs</a>
        </div>

      </div>
    </div>
  `,
  props: {
    id: 'string',
    secret: 'string',
    url: 'string',
    customer: 'string',
    args: 'string',
    argsVar: 'string',
    //syncToggle: ['boolean', false, false], // not support yet
    secretToggle: ['boolean', false, true]
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.customer = App.state.session.customer.name
    this.id = ''
    this.secret = ''
    this.url = ''
    this.args = ''
    this.argsVars = ''

    this.listenToAndRun(
      this.model,
      'change:credentials change:task_arguments',
      this.updateState
    )

    this.on('change:syncToggle change:secretToggle', this.updateState)
  },
  render () {
    View.prototype.render.apply(this,arguments)

    let el = this.el.querySelector('[data-hook=sample-code]')
    hljs.highlightElement(el, {language: 'bash'})

    this.configureClipboards()
  },
  configureClipboards () {
    $(this.el).on('shown.bs.tooltip', function (e) {
      setTimeout(function () {
        $(e.target).tooltip('hide')
      }, 2000)
    })

    const copyTooltip = (e) => {
      $(e.trigger)
        .attr('data-original-title', 'Copied!')
        .tooltip('show')
    }

    const idel = this.query('[data-hook=copy_id]')
    $(idel).tooltip({ trigger: 'click', placement: 'bottom' })
    this.clipId = new Clipboard(idel, { text: () => this.id })
    this.clipId.on('success', copyTooltip)

    const secretel = this.query('[data-hook=copy_secret]')
    $(secretel).tooltip({ trigger: 'click', placement: 'bottom' })
    this.clipSecret = new Clipboard(secretel, { text: () => this.secret })
    this.clipSecret.on('success', copyTooltip)

    const urlel = this.query('[data-hook=copy_url]')
    $(urlel).tooltip({ trigger: 'click', placement: 'bottom' })
    this.clipURL = new Clipboard(urlel, { text: () => this.url })
    this.clipURL.on('success', copyTooltip)
  },
  onClickToggle () {
    this.el.querySelector('.hidden-data').classList.toggle('visible')
  },
  updateState () {
    let credentials = this.model.credentials
    this.id = credentials?.id
    this.secret = credentials?.secret

    const baseUrl = `${config.supervisor_api_url}/workflows/${this.id}`
    const query = { }

    if (this.secretToggle === true) {
      this.url = `${baseUrl}/secret/${this.secret}/job`
    } else {
      query.access_token = '__theAccessToken__'
      this.url = `${baseUrl}/job`
    }

    if (this.syncToggle === true) {
      query.wait_result = "true"
    }

    this.url += '?' + qs.stringify(query)

    if (this.model.start_task.task_arguments.models.length > 0) {
      this.args = this.model
        .start_task
        .task_arguments
        .models.map(arg => `\"'\$\{${arg.label.replace(/ /g,'_')}\}'\"`)
        .join(',')

      this.argsVars = this.model
        .start_task
        .task_arguments
        .models.map(arg => `${arg.label.replace(/ /g,'_')}=""`)
        .join('\n')
    }
  },
  bindings: {
    id: [{
      hook: 'id',
      type: 'attribute',
      name: 'value'
    }],
    secret: [{
      hook: 'secret',
      type: 'attribute',
      name: 'value'
    }],
    url: [{
      hook: 'api_url',
      type: 'attribute',
      name: 'value'
    },{
      hook: 'curl_api_url'
    }],
    customer: {
      hook: 'workflow_customer'
    },
    args: {
      hook: 'task_args'
    },
    argsVars: {
      hook: 'args-vars'
    },
    //syncToggle: [
    //  {
    //    selector: '[data-hook=sync-toggle] label',
    //    type: (el, value) => {
    //      if (value === true) {
    //        el.innerText = 'Sync / Wait'
    //      } else {
    //        el.innerText = 'Async / No Wait'
    //      }
    //    }
    //  }
    //],
    secretToggle: [
      {
        selector: '[data-hook=secret-toggle] label',
        type: (el, value) => {
          if (value === true) {
            el.innerText = 'Secret'
          } else {
            el.innerText = 'Access Token'
          }
        }
      }
    ]
  },
  remove () {
    this.clipId.destroy()
    this.clipSecret.destroy()
    View.prototype.remove.apply(this, arguments)
  },
  events: {
    'click [data-hook=toggle-trigger]':'onClickToggle',
    'click button[data-hook=sync-toggle]':'onClickToggleSyncParams',
    'click button[data-hook=secret-toggle]':'onClickToggleSecretToken',
  },
  onClickToggleSyncParams (event) {
    event.preventDefault()
    event.stopPropagation()
    this.toggle('syncToggle')
  },
  onClickToggleSecretToken (event) {
    event.preventDefault()
    event.stopPropagation()
    this.toggle('secretToggle')
  }
})
