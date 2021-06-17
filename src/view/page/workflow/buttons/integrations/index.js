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

import hljs from 'highlight.js/lib/highlight'
import bash from 'highlight.js/lib/languages/bash'
hljs.registerLanguage('bash', bash)

const docsLink = 'integrations/api/api_resources_task/#2-using-the-task-secret-key-40recommended41'

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
      	  <input class="form-control form-input blurry-text" id="integrationId" readonly type="text" data-hook="id" value="">
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
      	  <input class="form-control form-input blurry-text" id="integrationSecret" readonly type="text" data-hook="secret" value="">
          <span class="input-group-btn">
            <button class="btn btn-primary" type="button" data-clipboard-target="#integrationSecret">
              <span class="fa fa-copy" alt="copy to clipboard"></span>
            </button>
          </span>
			  </div>
			</div>
      <div class="form-group">
        <a class="toggle" href="javascript:void(0)" data-hook="toggle-trigger">sample curl</a>
      </div>
      <div class="hidden-data form-group" data-hook="toggle-target">
        <label>curl sample using unix shell</label>
        <pre data-hook="sample-code">
          <code class="bash">
workflow="<span data-hook="workflow_id"></span>"
secret="<span data-hook="workflow_secret"></span>"
<span data-hook="args-vars"></span>

curl -i -sS -X POST "${config.supervisor_api_url}/workflows/\$\{workflow\}/secret/\$\{secret\}/job" \\
  --header 'Content-Type: application/json' \\
  --data '{"task_arguments":[<span data-hook="task_args"></span>]}'
          </code>
        </pre>
        <a href="${config.docs}/${docsLink}" target="_blank">Find more info in the docs</a>
      </div>
    </div>
  `,
  props: {
    id: 'string',
    secret: 'string',
    customer: 'string',
    args: 'string',
    argsVar: 'string'
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.customer = App.state.session.customer.name
    this.id = ''
    this.secret = ''
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
    hljs.highlightBlock(el)

    this.clipId = new Clipboard( this.query('[data-hook=id]') )
    this.clipSecret = new Clipboard( this.query('[data-hook=secret]') )
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
    },{
      hook: 'workflow_id'
    }],
    secret: [{
      hook: 'secret',
      type: 'attribute',
      name: 'value'
    },{
      hook: 'workflow_secret'
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
