'use strict'

import View from 'ampersand-view'
import CommonButton from 'components/common-button'
import Modalizer from 'components/modalizer'
import TaskFormView from '../form'
import TaskActions from 'actions/task'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'

import { Script as ScriptTask } from 'models/task'
import { Scraper as ScraperTask } from 'models/task'

import './buttons.less'

const TaskCreationWizard = View.extend({
  template: `
  <div>
    <section data-hook="type-selection-container" class="task-type-selection">
      <h1>Please, select the task type to continue</h1>
      <div class="row task-button" style="text-align:center;">
        <div class="col-xs-6">
          <button data-hook="script" class="btn btn-default">
            <i class="icons icons-script fa fa-code"></i>
          </button>
          <h2>Script
            <span data-hook="script-help"></span>
          </h2>
        </div>
        <div class="col-xs-6">
          <button data-hook="scraper" class="btn btn-default">
            <i class="icons icons-scraper fa fa-cloud"></i>
          </button>
          <h2>Outgoing Webhook/<br>HTTP Request
            <span data-hook="webhook-help"></span>
          </h2>
        </div>
      </div>
    </section>
    <section data-hook="form-container"></section>
  </div>
  `,
  events: {
    'click button[data-hook=script]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.createFormTask( new ScriptTask() )
    },
    'click button[data-hook=scraper]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.createFormTask( new ScraperTask() )
    }
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
  },
  /**
   * @param {Task} task a models/task instance
   */
  createFormTask (task) {
    this.queryByHook('type-selection-container').remove()
    const form = new TaskFormView({
      model: task,
    })
    //form.render()
    this.renderSubview(form,this.queryByHook('form-container'))
    this.form = form
    this.listenTo(form,'submitted',() => {
      this.trigger('created')
    })
  },
  remove () {
    if (this.form) this.form.remove()
    View.prototype.remove.apply(this,arguments)
  }
})

module.exports = CommonButton.extend({
  initialize (options) {
    this.title = 'Create a New Task'
    this.className = 'btn btn-primary'
    this.iconClass = 'fa fa-plus'
  },
  events: {
    click (event) {
      event.preventDefault()
      event.stopPropagation()

      const wizard = new TaskCreationWizard()
      const modal = new Modalizer({
        buttons: false,
        title: 'Create Task',
        bodyView: wizard
      })

      //this.listenTo(modal,'shown',() => { select.focus() })
      this.listenTo(modal,'hidden',() => {
        wizard.remove()
        modal.remove()
      })
      this.listenTo(wizard,'created',() => {
        modal.hide()
      })
      modal.show()
    }
  }
})
