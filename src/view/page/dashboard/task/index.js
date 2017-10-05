'use strict'

import App from 'ampersand-app'
import View from 'ampersand-view'
import JobOutput from '../job-output'
import ExecButton from './exec-button'
import SearchActions from 'actions/searchbox'
import TaskActions from 'actions/task'
import ScriptActions from 'actions/script'
import LIFECYCLE from 'constants/lifecycle'

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
    execution_lifecycle: {
      deps: ['model.lastjob.lifecycle'],
      fn () {
        const job = this.model.lastjob
        const lifecycle = job.lifecycle
        const state = job.state

        const isCompleted = (lifecycle) => {
          return [
            LIFECYCLE.COMPLETED, 
            LIFECYCLE.TERMINATED,
            LIFECYCLE.FINISHED,
          ].indexOf(lifecycle) !== -1
        }

        if (!lifecycle) return ''
        if ( lifecycle === LIFECYCLE.READY) return 'fa fa-spin fa-refresh'
        if (lifecycle === LIFECYCLE.ASSIGNED) return 'fa fa-spin fa-refresh remark-success'
        if (isCompleted(lifecycle)) {
          if (state === 'success') return 'fa fa-check remark-success'
          if (state === 'failure') return 'fa fa-exclamation remark-alert'
          else return 'fa fa-question remark-warning'
        }
        if (lifecycle === LIFECYCLE.CANCELED) {
          return 'fa fa-ban remark-alert'
        }
        if (lifecycle === LIFECYCLE.ASSIGNED) {
          return 'fa fa-ban remark-alert'
        }
        return 'fa fa-question remark-alert'
      }
    }
  },
  bindings: {
    execution_lifecycle: {
      hook: 'last_job_lifecycle',
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

const ScraperCollapsedContent = View.extend({
  template: `
    <div>
      <p>This task will be executed on '<i data-hook="hostname"></i>'</p>
      <i data-hook="description">no description</i>
      <h4>Request details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th></th>
            <th>URL</th>
            <th>Method</th>
            <th>Timeout</th>
            <th>Status Code</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><span data-hook="url"></span></td>
            <td><span data-hook="method"></span></td>
            <td><span data-hook="timeout"></span></td>
            <td><span data-hook="status_code"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  derived: {
    description: {
      deps: ['model.description'],
      fn () {
        return this.model.description || 'no description'
      }
    },
    timeout: {
      deps: ['model.timeout'],
      fn () {
        const time = this.model.timeout
        return (time / 1000) + ' s'
      }
    },
  },
  bindings: {
    'model.hostname': { hook: 'hostname' },
    'model.url': { hook: 'url' },
    'model.method': { hook: 'method' },
    'model.status_code': { hook: 'status_code' },
    timeout: { hook: 'timeout' },
    description: { hook: 'description' },
  }
})

const ScriptCollapsedContent = View.extend({
  template: `
    <div>
      <p>This task will be executed on '<i data-hook="hostname"></i>'</p>
      <i data-hook="description">no description</i>
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
            <td><button data-hook="edit_script" class="fa fa-edit btn btn-sm btn-primary"></button></td>
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
    },
    description: {
      deps: ['model.description'],
      fn () {
        return this.model.description || 'no description'
      }
    }
  },
  events: {
    'click button[data-hook=edit_script]': 'onClickEditScript'
  },
  onClickEditScript (event) {
    event.preventDefault()
    event.stopPropagation()

    if (!this.model.script || !this.model.script.id) return

    ScriptActions.edit(this.model.script.id)

    return false
  },
  bindings: {
    'model.hostname': { hook: 'hostname' },
    'model.script.description': { hook: 'script_description' },
    'model.script.filename': { hook: 'script_filename' },
    script_language: { hook: 'script_language' },
    description: { hook: 'description' },
    'model.script.id': {
      hook: 'edit_script',
      type: 'booleanAttribute',
      name: 'disabled',
      invert: true
    }
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
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return this.model.hostname || 'Hostname not assigned'
      }
    },
    description: {
      deps: ['model.description'],
      fn () {
        return this.model.description || 'no description'
      }
    },
    type: {
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
    type: { hook: 'type' },
    description: { hook: 'description' },
    hostname: { hook: 'hostname' },
    show: {
      type: 'toggle'
    }
  },
  events: {
    'click .collapsed[data-hook=collapse-toggle]': 'onClickToggleCollapse'
  },
  // capture and handle collapse event 
  onClickToggleCollapse (event) {
    TaskActions.populate(this.model)
    return 
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
      new ExecButton({ model: this.model }),
      this.queryByHook('execute-button-container')
    )
  },
  renderCollapsedContent () {
    let content
    if (this.model.type === 'script') {
      content = new ScriptCollapsedContent({ model: this.model })
    } else {
      content = new ScraperCollapsedContent({ model: this.model })
    }

    this.renderSubview(content, this.queryByHook('collapse-container-body'))
  }
})
