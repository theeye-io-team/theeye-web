import App from 'ampersand-app'
import acls from 'lib/acls'
import View from 'ampersand-view'
import SearchActions from 'actions/searchbox'
import TaskActions from 'actions/task'
import FileActions from 'actions/file'
import LIFECYCLE from 'constants/lifecycle'
import EditTaskButton from 'view/page/task/buttons/edit'
import JobResult from '../../job-result'
import ExecTaskButton from './exec-button'
import CollapsibleRow from '../collapsible-row'

import lang2ext from 'lib/lang2ext'

module.exports = CollapsibleRow.extend({
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return `(${this.model.hostname})` || '(Hostname not assigned)'
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
  onClickToggleCollapse (event) {
    TaskActions.populate(this.model)
    return
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

    if (acls.hasAccessLevel('user')) {
      const button = this.renderSubview(
        new ExecTaskButton({ model: this.model }),
        this.queryByHook('execute-button-container')
      )
    }
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

const TaskButtonsView = View.extend({
  template: `
    <div>
      <li>
        <button data-hook="last_exec" class="btn btn-primary" title="Execution output">
          <i class="fa fa-file-text-o" aria-hidden="true"></i>
          <i data-hook="last_job_lifecycle" style="top:-6px;position:relative;right:4px;font-size:12px"></i> </li>
        </button>
      </li>
      <span data-hook="edit-button"> </span>
      <li>
        <button data-hook="search" class="btn btn-primary tooltiped" title="Search related elements">
          <i class="fa fa-search" aria-hidden="true"></i>
        </button>
      </li>
    </div>
  `,
  derived: {
    execResult: {
      deps: ['model.lastjob.result'],
      fn () {
        const lastjob = this.model.lastjob
        if (!lastjob) return
        return Boolean(lastjob.result)
      }
    },
    execution_lifecycle: {
      deps: ['model.lastjob.lifecycle'],
      fn () {
        const job = this.model.lastjob
        if (!job) return

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
        if (lifecycle === LIFECYCLE.READY) return 'fa fa-spin fa-refresh'
        if (lifecycle === LIFECYCLE.ASSIGNED) return 'fa fa-spin fa-refresh remark-success'
        if (isCompleted(lifecycle)) {
          if (state === 'failure') return 'fa fa-exclamation remark-alert'
          return 'fa fa-check remark-success'
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
    //execResult: {
    //  type: 'booleanAttribute',
    //  name: 'disabled',
    //  hook: 'last_exec',
    //  invert: true
    //}
  },
  events: {
    //'click button[data-hook=edit]':'onClickEdit',
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

    const view = new JobResult({ job: this.model.lastjob })
    view.show()

    return false
  },
  //onClickEdit (event) {
  //  event.stopPropagation()
  //  event.preventDefault()
  //  window.location = "/admin/task#search=" + this.model.id
  //  return false
  //},
  render () {
    this.renderWithTemplate(this)

    if (acls.hasAccessLevel('admin')) {
      var button = new EditTaskButton({ model: this.model })
      this.renderSubview(button, this.queryByHook('edit-button'))
    }
  }
})

const ScraperCollapsedContent = View.extend({
  template: `
    <div class="task-container">
      <h4><i data-hook="name"></i></h4>
      <h4>This task is assigned to '<i data-hook="hostname"></i>'</h4>
      <p class="text-block" data-hook="description">no description</p>
      <h4>Request details</h4>
      <div class="text-block">
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
              <td><span data-hook="remote_url"></span></td>
              <td><span data-hook="method"></span></td>
              <td><span data-hook="timeout"></span></td>
              <td><span data-hook="status_code"></span></td>
            </tr>
          </tbody>
        </table>
      </div>
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
    'model.remote_url': { hook: 'remote_url' },
    'model.method': { hook: 'method' },
    'model.status_code': { hook: 'status_code' },
    timeout: { hook: 'timeout' },
    description: { hook: 'description' },
    'model.name': { hook: 'name'}
  }
})

const ScriptCollapsedContent = View.extend({
  template: `
    <div class="task-container">
      <h4><i data-hook="name"></i></h4>
      <h4>This task is assigned to '<i data-hook="hostname"></i>'</h4>
      <p class="text-block" data-hook="description">no description</p>
      <h4>Script details</h4>
      <div class="text-block">
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
          <tbody data-hook="table-body">
            <tr>
              <td></td>
              <td><span data-hook="script_description"></span></td>
              <td><span data-hook="script_filename"></span></td>
              <td><span data-hook="script_language"></span></td>
            </tr>
          </tbody>
        </table>
      </div>
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

    FileActions.edit(this.model.script.id)

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
    },
    'model.name': { hook: 'name'}
  },
  render () {
    this.renderWithTemplate(this)
    if (acls.hasAccessLevel('admin')) {
      this.query('tbody tr').innerHTML += `<td><button data-hook="edit_script" title="Edit the script" class="fa fa-edit btn btn-sm btn-primary"></button></td>`
    }
  }
})
