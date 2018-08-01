import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import TaskActions from 'actions/task'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import TaskFormView from '../form'
import TaskOnBoarding from '../taskOnboarding'

import { Script as ScriptTask } from 'models/task'
import { Scraper as ScraperTask } from 'models/task'
import { Approval as ApprovalTask } from 'models/task'
import { Dummy as DummyTask } from 'models/task'

import './styles.less'

const TaskCreationWizard = View.extend({
  template: `
  <div>
    <section data-hook="type-selection-container" class="task-type-selection">
      <h1>Please, select the task type to continue</h1>
      <div class="row task-button" style="text-align:center;">
        <div class="col-xs-3">
          <button data-hook="script" class="btn btn-default">
            <i class="icons icons-script fa fa-code"></i>
          </button>
          <h2>Script<span data-hook="script-help"></span></h2>
        </div>
        <div class="col-xs-3">
          <button data-hook="scraper" class="btn btn-default">
            <i class="icons icons-scraper fa fa-cloud"></i>
          </button>
          <h2>Outgoing Webhook/<br>HTTP Request
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
        <div class="col-xs-3">
          <button data-hook="approval" class="btn btn-default">
            <i class="icons icons-approval fa fa-thumbs-o-up"></i>
          </button>
          <h2>Approval<span data-hook="approval-help"></span></h2>
        </div>
        <div class="col-xs-3">
          <button data-hook="dummy" class="btn btn-default">
            <i class="icons icons-dummy fa fa-terminal"></i>
          </button>
          <h2>Input<span data-hook="dummy-help"></span></h2>
        </div>
      </div>
    </section>
    <section data-hook="form-container"></section>
  </div>
  `,
  events: {
    'click button[data-hook=script]': 'launchScriptTaskForm',
    'click button[data-hook=scraper]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.createFormTask( new ScraperTask() )
    },
    'click button[data-hook=approval]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.createFormTask( new ApprovalTask() )
    },
    'click button[data-hook=dummy]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.createFormTask( new DummyTask() )
    }
  },
  launchScriptTaskForm: function (event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    this.createFormTask(new ScriptTask())
  },
  render () {
    this.renderWithTemplate(this)

    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'task_help',
        text: HelpTexts.task.creation.webhook
      }),
      this.queryByHook('webhook-help')
    )

    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'task_help',
        text: HelpTexts.task.creation.script
      }),
      this.queryByHook('script-help')
    )

    if(App.state.onboarding.onboardingActive) {
      var taskOnBoarding = new TaskOnBoarding({parent: this})
      this.registerSubview(taskOnBoarding)
      taskOnBoarding.step1()
    }
  },
  /**
   * @param {Task} task a models/task instance
   */
  createFormTask (task) {
    this.queryByHook('type-selection-container').remove()
    const form = new TaskFormView({ model: task })
    //form.render()
    this.renderSubview(form,this.queryByHook('form-container'))
    this.form = form
    this.listenTo(form,'submitted',() => { this.trigger('submitted') })
  },
  remove () {
    if (this.form) this.form.remove()
    View.prototype.remove.apply(this,arguments)
  }
})

module.exports = function () {
  const wizard = new TaskCreationWizard()
  wizard.render()
  const modal = new Modalizer({
    buttons: false,
    title: 'Create Task',
    bodyView: wizard
  })

  //this.listenTo(modal,'shown',() => { select.focus() })
  modal.on('hidden',() => {
    wizard.remove()
    modal.remove()
  })

  wizard.on('submitted',() => { modal.hide() })
  modal.show()
  modal.wizard = wizard
  return modal
}
