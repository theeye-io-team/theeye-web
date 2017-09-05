'use strict'

import App from 'ampersand-app'
import View from 'ampersand-view'
import bootbox from 'bootbox'
import JobOutput from '../job-output'
import ExecButton from './exec-button'
import JobActions from 'actions/job'
import SearchActions from 'actions/searchbox'
import TaskActions from 'actions/task'

import lang2ext from 'lib/lang2ext'

const TaskButtonsView = View.extend({
  template: require('./buttons.hbs'),
  derived: {
    executed: {
      deps: ['model.lastjob.result'],
      fn () {
        return Boolean(this.model.lastjob.result)
      }
    },
    execution_state: {
      deps: ['model.lastjob.state'],
      fn () {
        const state = this.model.lastjob.state
        if (!state) return ''
        if (state === 'new') return 'fa fa-spin fa-refresh'
        if (state === 'success') return 'fa fa-check remark-success'
        if (state === 'failure') return 'fa fa-exclamation remark-alert'
        else return 'fa fa-question remark-warning'
      }
    }
  },
  bindings: {
    execution_state: {
      hook: 'last_job_state',
      type: 'attribute',
      name: 'class'
    },
    executed: {
      type: 'booleanAttribute',
      name: 'disabled',
      hook: 'last_exec',
      invert: true
    }
  },
  events: {
    'click button[data-hook=workflow]':'onClickWorkflow',
    'click button[data-hook=edit]':'onClickEdit',
    'click button[data-hook=search]':'onClickSearch',
    'click button[data-hook=last_exec]':'onClickLastExecution',
  },
  onClickSearch (event) {
    event.preventDefault()
    event.stopPropagation()

    SearchActions.search(this.model.name)

    return false
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
})

const ScriptCollapsedContent = View.extend({
  template: `
    <div>
      <span>This task will be executed on '<i data-hook="hostname"></i>'</span>
      <h4>Script details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th></th>
            <th>Description</th>
            <th>Filename</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><span data-hook="script_description"></span></td>
            <td><span data-hook="script_filename"></span></td>
            <td><span data-hook="script_language"></span></td>
            <td><button class="fa fa-edit btn btn-sm btn-primary"></button></td>
          </tr>
        </tbody>
      </table>
    </div>
    `,
  derived: {
    script_language: {
      deps: ['model.script.extension'],
      fn () {
        const ext = this.model.script.extension
        return lang2ext.langFor[ext]
      }
    }
  },
  bindings: {
    'model.hostname': { hook: 'hostname' },
    'model.script.description': { hook: 'script_description' },
    'model.script.filename': { hook: 'script_filename' },
    script_language: { hook: 'script_language' }
  }
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
    collapsedHeaderId: {
      deps: ['model.id'],
      fn () {
        return `collapse_heading_${this.model.id}`
      }
    },
    collapseContainerId: {
      deps: ['model.id'],
      fn () {
        return `collapse_container_${this.model.id}`
      }
    },
    formatted_hostname: {
      deps: ['model.hostname'],
      fn () {
        return this.model.hostname || 'Hostname not assigned'
      }
    },
    formatted_description: {
      deps: ['model.description'],
      fn () {
        return this.model.description || 'Description is not available'
      }
    },
    formatted_type: {
      cache: true,
      deps: ['model.type'],
      fn () {
        const type = this.model.type
        if (type === 'scraper') return 'web request'
        if (type === 'script') return 'script'
      }
    },
    type_icon: {
      cache: true,
      deps: ['model.type'],
      fn () {
        const type = this.model.type
        if (type === 'scraper') return 'fa fa-cloud'
        if (type === 'script') return 'fa fa-code'
      }
    },
    header_type_icon: {
      cache: true,
      deps: ['model.type'],
      fn () {
        const type = this.model.type
        if (type === 'scraper') return 'circle fa fa-cloud scraper-color'
        if (type === 'script') return 'circle fa fa-code script-color'
      }
    }
  },
  bindings: {
    'model.name': { hook: 'name' },
    type_icon: {
      type: 'attribute',
      name: 'class',
      hook: 'type-icon'
    },
    header_type_icon: {
      type: 'attribute',
      name: 'class',
      hook: 'header-icon'
    },
    formatted_type: { hook: 'type' },
    formatted_description: { hook: 'description' },
    formatted_hostname: { hook: 'hostname' },
    show: {
      type: 'toggle'
    }
  },
  events: {
    'click button[data-hook=trigger]':'onClickTrigger',
    'click .collapsed[data-hook=collapse-toggle]': 'onClickToggleCollapse'
  },
  // capture and handle collapse event 
  onClickToggleCollapse (event) {
    TaskActions.populate(this.model)
    return 
  },
  onClickTrigger (event) {
    event.stopPropagation()
    event.preventDefault()

    if (!this.model.canExecute) return

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
    this.renderCollapsedContent()
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
    const button = this.renderSubview(
      new ExecButton({ model: this.model.lastjob }),
      this.queryByHook('execute-button-container')
    )

    if (!this.model.canExecute) {
      button.disabled = true
    }
  },
  renderCollapsedContent () {
    if (this.model.type === 'script') {
      this.renderSubview(
        new ScriptCollapsedContent({
          model: this.model
        }),
        this.queryByHook('collapse-container-body')
      )
    } else {
    }
  }
})
