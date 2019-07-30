import config from 'config'
import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import TaskFormView from '../form'
import TaskOnBoarding from '../taskOnboarding'
import FileInputView from 'components/input-view/file'
import bootbox from 'bootbox'

import { Script as ScriptTask } from 'models/task'
import { Scraper as ScraperTask } from 'models/task'
import { Approval as ApprovalTask } from 'models/task'
import { Dummy as DummyTask } from 'models/task'
import { Notification as NotificationTask } from 'models/task'
import { Model as File } from 'models/file'

import './styles.less'

const docsLink = 'core-concepts/tasks/'

module.exports = function () {
  const wizard = new TaskCreationWizard()
  wizard.render()
  const modal = new Modalizer({
    buttons: false,
    title: 'Create Task',
    bodyView: wizard
  })

  modal.renderSubview(
    new HelpIconView({ link: `${config.docs}/${docsLink}` }),
    modal.queryByHook('title')
  )

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

const ImportTaskInputView = FileInputView.extend({
  template: `
    <div>
      <div class="upload-btn-wrapper">
        <button for="file-upload" data-hook="button-label" class="btn btn-primary">
          <i class="fa fa-upload"></i> Import
        </button>
        <input id="file-upload" type="file">
      </div>
    </div>
  `
})

const TaskCreationWizard = View.extend({
  template: `
  <div>
    <section data-hook="type-selection-container" class="task-type-selection">
      <h1>Please, select the task type to continue</h1>
      <div class="row task-button" style="text-align:center;">
        <div class="col-xs-2 col-xs-offset-1">
          <button data-hook="script" class="btn btn-default">
            <i class="icons icons-script fa fa-code"></i>
          </button>
          <h2>Script<span data-hook="script-help"></span></h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="scraper" class="btn btn-default">
            <i class="icons icons-scraper fa fa-cloud"></i>
          </button>
          <h2>Outgoing Webhook/<br>HTTP Request
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="approval" class="btn btn-default">
            <i class="icons icons-approval fa fa-thumbs-o-up"></i>
          </button>
          <h2>Approval<span data-hook="approval-help"></span></h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="dummy" class="btn btn-default">
            <i class="icons icons-dummy fa fa-list-ul"></i>
          </button>
          <h2>Input<span data-hook="dummy-help"></span></h2>
        </div>
        <div class="col-xs-2">
          <button data-hook="notification" class="btn btn-default">
            <i class="icons icons-notification fa fa-bell-o"></i>
          </button>
          <h2>Notification<span data-hook="notification-help"></span></h2>
        </div>
      </div>
      <div class="import-task-section">
        <h1>Or you can import a task from a file</h1>
        <div data-hook="import-task-container"></div>
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
    },
    'click button[data-hook=notification]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.createFormTask( new NotificationTask() )
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

    if (App.state.onboarding.onboardingActive) {
      var taskOnBoarding = new TaskOnBoarding({parent: this})
      this.registerSubview(taskOnBoarding)
      taskOnBoarding.step1()
    }

    this.importTaskInput = new ImportTaskInputView({
      callback: (file) => {
        if (file && /json\/*/.test(file.type) === true && file.contents && file.contents.length) {
          try {
            let recipe = JSON.parse(file.contents)
            let task = App.actions.task.parseRecipe(recipe)
            this.createFormTask(task, {isImport: true})
          } catch (e) {
            console.log(e)
            bootbox.alert('Invalid JSON file.')
          }
        } else {
          bootbox.alert('File not supported, please select a JSON file.')
        }
        this.importTaskInput.reset()
      }
    })

    this.renderHelp()

    this.renderSubview(
      this.importTaskInput,
      this.queryByHook('import-task-container')
    )
  },
  renderHelp () {
    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'task_help',
        text: HelpTexts.task.creation.script
      }),
      this.queryByHook('script-help')
    )

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
        text: HelpTexts.task.creation.approval
      }),
      this.queryByHook('approval-help')
    )

    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'task_help',
        text: HelpTexts.task.creation.dummy
      }),
      this.queryByHook('dummy-help')
    )

    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'task_help',
        text: HelpTexts.task.creation.notification
      }),
      this.queryByHook('notification-help')
    )

  },
  /**
   * @param {Task} task a models/task instance
   */
  createFormTask (task, options) {
    this.queryByHook('type-selection-container').remove()

    options = Object.assign({}, options, {model: task})

    const form = new TaskFormView(options)
    this.renderSubview(form,this.queryByHook('form-container'))
    this.form = form
    this.listenTo(form,'submitted',() => { this.trigger('submitted') })
  },
  remove () {
    if (this.form) this.form.remove()
    View.prototype.remove.apply(this,arguments)
  }
})
