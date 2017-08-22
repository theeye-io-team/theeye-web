'use strict'

import App from 'ampersand-app'
import View from 'ampersand-view'
import JobActions from 'actions/job'
import bootbox from 'bootbox'
import JobOutput from '../job-output'
import ExecButton from './exec-button'

const TaskButtonsView = View.extend({
  template: require('./buttons.hbs')
})

/**
 * tasks rows
 */
module.exports = View.extend({
  template: require('./row.hbs'),
  props: {
    show: ['boolean',false,true]
  },
  derived: {
    executed: {
      deps: ['model.lastjob.result'],
      fn () {
        return Boolean(this.model.lastjob.result)
      }
    }
  },
  bindings: {
    'model.type': { hook: 'type' },
    'model.description': { hook: 'description' },
    'model.hostname': { hook: 'hostname' },
    'model.lastjob.success': [
      {
        hook: 'last-job-state',
        type: 'booleanClass',
        yes: 'fa-check',
        no: 'fa-remove'
      },{
        hook: 'last-job-state',
        type: 'booleanClass',
        yes: 'remark-success',
        no: 'remark-alert'
      }
    ],
    executed: [
      {
        type: 'booleanAttribute',
        name: 'disabled',
        hook: 'last_exec',
        invert: true
      },{
        type: 'toggle',
        hook: 'last-job-state'
      }
    ],
    show: {
      type: 'toggle'
    }
  },
  events: {
    'click button[data-hook=workflow]':'onClickWorkflow',
    'click button[data-hook=edit]':'onClickEdit',
    'click button[data-hook=trigger]':'onClickTrigger',
    'click a[data-hook=last_exec]':'onClickLastExecution'
  },
  onClickLastExecution (event) {
    event.preventDefault()
    event.stopPropagation()

    const getResult = () => {
      return this.model.lastjob.result
    }

    const view = new JobOutput({ output: getResult() })
    view.show()

    this.listenTo(this.model.lastjob, 'change:result', () => {
      view.output = getResult()
    })

    return false
  },
  onClickWorkflow (event) {
    event.stopPropagation()
    event.preventDefault()
    window.location = '/admin/workflow?node=' + this.model.id
    return false
  },
  onClickEdit (event) {
    event.stopPropagation()
    event.preventDefault()
    window.location = "/admin/task#search=" + this.model.id
    return false
  },
  onClickTrigger (event) {
    event.stopPropagation()
    event.preventDefault()

    const message = `You are going to run the task <b>${this.model.name}</b>. Continue?`
    bootbox.confirm(message, (confirmed) => {
      if (confirmed) {
        JobActions.create(this.model)
      }
    })

    return false
  },
  render () {
    this.renderWithTemplate()
    this.renderButtons()
  },
  renderButtons () {
    this.renderSubview(
      new TaskButtonsView({ model: this.model }),
      this.query('div[data-hook=buttons-container]')
    )
    this.renderSubview(
      new TaskButtonsView({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )
    this.renderSubview(
      new ExecButton({ model: this.model.lastjob }),
      this.queryByHook('execute-button-container')
    )
  }
})
