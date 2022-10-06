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
import CatalogueView from 'components/catalogue'

import { Script as ScriptTask } from 'models/task'
import { Scraper as ScraperTask } from 'models/task'
import { Approval as ApprovalTask } from 'models/task'
//import { Dummy as DummyTask } from 'models/task'
import { Notification as NotificationTask } from 'models/task'
import { Model as File } from 'models/file'

import './styles.less'

const docsLink = 'core-concepts/tasks/'

export default function (options = {}) {
  const wizard = new TaskCreationWizard({ submit: options?.submit })
  wizard.render()

  const modal = new Modalizer({
    buttons: false,
    title: 'Create Task',
    bodyView: wizard
  })

  modal.onClickClose = (event) => {
    App.actions.onboarding.hideOnboarding()
    event.stopPropagation()
    event.preventDefault()
    modal.trigger('close')
    modal.hide()
  },

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

const TaskCreationWizard = View.extend({
  props: {
    submit: 'any'
  },
  template: `
    <div data-component="task-creation-wizard">
      <section data-hook="type-selection-container" class="task-type-selection">
        <h1>Please, select the task type to continue</h1>
        <div class="container" data-hook="type-selection-view-container"></div>
        <div class="import-task-section">
          <h1>Or you can import a task from a file</h1>
          <div data-hook="import-task-container"></div>
        </div>
      </section>
      <section data-hook="form-container"></section>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    const buttons = [
      {
        name: 'Script',
        id: 'script',
        short_description: HelpTexts.task.creation.script,
        callback: () => {
          this.renderCreateFormTask(new ScriptTask())
        },
        icon_image: '/images/script.png',
        icon_class: 'fa fa-code',
        icon_color: '#E50580',
      }, {
        name: 'Outgoing Webhook',
        id: 'scraper',
        short_description: HelpTexts.task.creation.webhook,
        callback: () => {
          this.renderCreateFormTask(new ScraperTask())
        },
        icon_class: 'fa fa-cloud',
        icon_color: '#1E7EFB',
        icon_image: '/images/web_check.png',
      }, {
        name: 'Approval',
        id: 'approval',
        short_description: HelpTexts.task.creation.approval,
        callback: () => {
          this.renderCreateFormTask(new ApprovalTask())
        },
        icon_class: 'fa fa-thumbs-o-up',
        icon_color: '#22C000',
        icon_image: '/images/approval.png',
      }, {
        name: 'Notification',
        id: 'notification',
        short_description: HelpTexts.task.creation.notification,
        callback: () => {
          this.renderCreateFormTask(new NotificationTask())
        },
        icon_class: 'fa fa-bell-o',
        icon_color: '#FFCC00',
        icon_image: '/images/notification.png',
      }
    ]

    const catalogue = new CatalogueView({ buttons })

    this.renderSubview(catalogue, this.queryByHook('type-selection-view-container'))
    
    if (App.state.onboarding.onboardingActive) {
      var taskOnBoarding = new TaskOnBoarding({parent: this})
      this.registerSubview(taskOnBoarding)
      taskOnBoarding.step1()
    }

    this.importTaskInput = new ImportTaskInputView({
      callback: (file) => {
        if (
          file &&
          /json\/*/.test(file.type) === true &&
          file.contents &&
          file.contents.length
        ) {
          let recipe
          try {
            recipe = JSON.parse(file.contents)
          } catch (e) {
            console.log(e)
            bootbox.alert('Invalid JSON file.')
          }

          const task = App.actions.task.parseSerialization(recipe)
          this.renderImportFormTask(task)
        } else {
          bootbox.alert('File not supported, please select a JSON file.')
        }
        this.importTaskInput.reset()
      }
    })

    this.renderSubview(
      this.importTaskInput,
      this.queryByHook('import-task-container')
    )
  },

  /**
   * @param {Task} task a models/task instance
   */
  renderCreateFormTask (task) {
    this.queryByHook('type-selection-container').remove()
    const form = new TaskFormView({ model: task })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form
    this.listenTo(form, 'submit', data => {
      if (this.submit) {
        this.submit(data)
      } else {
        App.actions.task.create(data)
      }

      this.trigger('submitted')
    })
  },
  renderImportFormTask (task) {
    this.queryByHook('type-selection-container').remove()

    let script, mode = 'import'
    if (task.script_id) {
      script = App.state.files.get(task.script_id)
      if (!script) {
        task.script_id = null
      } else {
        mode = null
      }
    }

    script || (script = task.script)

    const form = new TaskFormView({ model: task, mode })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form

    this.listenTo(form, 'submit', data => {
      data.script = script.serialize() // data from imported file. was not persisted yet
      if (this.submit) {
        this.submit(data)
      } else {
        App.actions.task.create(data)
      }

      this.trigger('submitted')
    })
  },
  remove () {
    if (this.form) { this.form.remove() }
    View.prototype.remove.apply(this,arguments)
  },
  update () {
    // DO NOT REMOVE THIS METHOD. It must do nothing
  }
})

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

