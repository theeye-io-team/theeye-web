import App from 'ampersand-app'
import acls from 'lib/acls'
import View from 'ampersand-view'
import SearchActions from 'actions/searchbox'
import TaskActions from 'actions/task'
import FileActions from 'actions/file'
import TaskConstants from 'constants/task'
import EditTaskButton from 'view/page/task/buttons/edit'
import CopyTaskButton from 'view/page/task/buttons/copy'
import JobResult from '../../job-result'
import ExecTaskButton from './exec-button'
import CollapsibleRow from '../collapsible-row'
import lang2ext from 'lib/lang2ext'

module.exports = function (options) {
  switch (options.model.type) {
    case TaskConstants.TYPE_SCRIPT:
      return new ScriptCollapsibleRow(options)
      break;
    case TaskConstants.TYPE_SCRAPER:
      return new ScraperCollapsibleRow(options)
      break;
    case TaskConstants.TYPE_APPROVAL:
      return new ApprovalCollapsibleRow(options)
      break;
  }
}

const TaskCollapsibleRow = CollapsibleRow.extend({
  onClickToggleCollapse (event) {
    TaskActions.populate(this.model)
    return
  },
  renderButtons () {
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
  }
})

const ScriptCollapsibleRow = TaskCollapsibleRow.extend({
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return `(${this.model.hostname})` || '(Hostname not assigned)'
      }
    },
    type: {
      fn: () => TaskConstants.TYPE_SCRIPT
    },
    type_icon: {
      fn: () => 'fa fa-code'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-code script-color'
    }
  },
  renderCollapsedContent () {
    var content = new ScriptCollapsedContent({ model: this.model })
    this.renderSubview(content, this.queryByHook('collapse-container-body'))
  }
})

const ScraperCollapsibleRow = TaskCollapsibleRow.extend({
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return `(${this.model.hostname})` || '(Hostname not assigned)'
      }
    },
    type: {
      fn: () => TaskConstants.TYPE_SCRAPER
    },
    type_icon: {
      fn: () => 'fa fa-code'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-cloud scraper-color'
    }
  },
  renderCollapsedContent () {
    var content = new ScraperCollapsedContent({ model: this.model })
    this.renderSubview(content, this.queryByHook('collapse-container-body'))
  }
})

const ApprovalCollapsibleRow = TaskCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => TaskConstants.TYPE_APPROVAL
    },
    type_icon: {
      fn: () => 'fa fa-thumbs-o-up'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-thumbs-o-up approval-color'
    }
  },
  renderCollapsedContent () {
    var content = new ApprovalCollapsedContent({ model: this.model })
    this.renderSubview(content, this.queryByHook('collapse-container-body'))
  }
})

const TaskButtonsView = View.extend({
  template: `
    <div>
      <li>
        <button data-hook="last_exec" class="btn btn-primary" title="Execution output">
          <i class="fa fa-file-text-o" aria-hidden="true"></i>
        </button>
      </li>
      <li>
        <button class="btn btn-primary tooltiped" title="Workflow" data-hook="workflow">
          <i class="fa fa-sitemap" aria-hidden="true"></i>
        </button>
      </li>
      <span data-hook="edit-button"> </span>
      <span data-hook="copy-button"> </span>
      <li>
        <button data-hook="recipe" class="btn btn-primary tooltiped" title="Export this task recipe">
          <i class="fa fa-file-code-o" aria-hidden="true"></i>
        </button>
      </li>
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
  },
  events: {
    //'click button[data-hook=edit]':'onClickEdit',
    'click button[data-hook=search]':'onClickSearch',
    'click button[data-hook=last_exec]':'onClickLastExecution',
    'click button[data-hook=workflow]':'onClickWorkflow',
    'click button[data-hook=recipe]':'onClickRecipe',
  },
  onClickRecipe (event) {
    event.stopPropagation()
    event.preventDefault()
    TaskActions.exportRecipe(this.model.id)
    return false
  },
  onClickWorkflow (event) {
    event.stopPropagation();
    event.preventDefault();
    TaskActions.nodeWorkflow(this.model.id)
    return false;
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
      var editButton = new EditTaskButton({ model: this.model })
      this.renderSubview(editButton, this.queryByHook('edit-button'))

      var copyButton = new CopyTaskButton({ model: this.model })
      this.renderSubview(copyButton, this.queryByHook('copy-button'))
    }

    $( this.query('.tooltiped') ).tooltip()
  }
})

const ApprovalCollapsedContent = View.extend({
  template: `
    <div class="task-container">
      <h4><i data-hook="name"></i></h4>
    </div>
  `,
  bindings: {
    'model.name': { hook: 'name' }
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
