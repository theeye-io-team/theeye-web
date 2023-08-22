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
            <button class="btn btn-primary" type="button" data-clipboard-target="#integrationId">
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
            <button class="btn btn-primary" type="button" data-clipboard-target="#integrationSecret">
              <span class="fa fa-copy" alt="copy to clipboard"></span>
            </button>
          </span>
			  </div>
			</div>
			<div class="form-group">
		  	<label>Full URL</label>
        <div class="input-group">
      	  <input class="form-control form-input" id="api_url" readonly type="text" data-hook="api_url" value="">
          <span class="input-group-btn">
            <button class="btn btn-primary" type="button" data-clipboard-target="#api_url">
              <span class="fa fa-copy" alt="copy to clipboard"></span>
            </button>
          </span>
			  </div>
			</div>
      <div class="form-group">
        <ul class="nav nav-tabs" href="javascript:void(0)">
          <li role="presentation" class="active">
            <a style="cursor:pointer;" data-hook="toggle-trigger" href="#">Shell Curl</a>
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
    argsVar: 'string'
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
  },
  render () {
    View.prototype.render.apply(this,arguments)

    let el = this.el.querySelector('[data-hook=sample-code]')
    hljs.highlightElement(el, {language: 'bash'})

    this.clipId = new Clipboard( this.query('[data-hook=id]') )
    this.clipSecret = new Clipboard( this.query('[data-hook=secret]') )
    this.clipURL = new Clipboard( this.query('[data-hook=api_url]') )
  },
  events: {
    'click [data-hook=toggle-trigger]':'onClickToggle'
  },
  onClickToggle () {
    this.el.querySelector('.hidden-data').classList.toggle('visible')
  },
  updateState () {
    let credentials = this.model.credentials

    if (
      credentials &&
      typeof credentials == 'object' &&
      credentials.hasOwnProperty('id') &&
      credentials.hasOwnProperty('secret')
    ) {
      this.id = credentials.id
      this.secret = credentials.secret

      this.url = `${config.supervisor_api_url}/workflows/${this.id}/secret/${this.secret}/job`
    }

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
    }
  },
  remove () {
    this.clipId.destroy()
    this.clipSecret.destroy()
    View.prototype.remove.apply(this, arguments)
  }
})
