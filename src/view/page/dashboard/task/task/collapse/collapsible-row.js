import App from 'ampersand-app'
import View from 'ampersand-view'
import moment from 'moment'
import SearchActions from 'actions/searchbox'
import ExecTaskButton from '../task-exec-button'
import TaskIntegrationButton from 'view/page/task/buttons/integrations'
import EditTaskButton from 'view/page/task/buttons/edit'
import CopyTaskButton from 'view/page/task/buttons/copy'
import DeleteTaskButton from 'view/page/task/buttons/delete'
import ExportTaskButton from 'view/page/task/buttons/export'
import ReviewPendingTaskButton from 'view/page/task/buttons/refresh'
import CollapsibleRow from 'view/page/dashboard/task/collapsible-row'
import SchedulesView from 'view/page/task/schedules'
import Acls from 'lib/acls'
import JobRow from './job'
import JobsList from 'view/page/dashboard/task/jobs-list'
import JobsPaginator from 'view/page/paginator/footer'
import DownloadButton from 'view/buttons/download'

import './styles.less'

export default CollapsibleRow.extend({
  onClickToggleCollapse (event) {
    App.actions.task.populate(this.model)
    return
  },
  renderButtons () {
    this.renderSubview(
      new TaskButtonsView({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )

    if (Acls.hasAccessLevel('user')) {
      const button = this.renderSubview(
        new ExecTaskButton({ model: this.model }),
        this.queryByHook('execute-button-container')
      )
    }
  },
  renderCollapsedContent () {
    this.collapsedContent = new CollapsedContentView({ model: this.model })
    this.renderSubview(
      this.collapsedContent,
      this.queryByHook('collapse-container-body')
    )
  }
})

const dateElem = (date) => {
  let col = document.createElement('div')
  col.innerHTML = moment(date).format('DD-MM-YYYY HH:mm:ss')
  return col
}

const InputsView = View.extend({
  props: {
    data: 'object'
  },
  template: `<div data-component="inputs-row"></div>`,
  render () {
    this.renderWithTemplate(this)

    this.listenToAndRun(this.model, 'change:_values', () => {
      const job = this.model._values
      if (!job) return
      this.renderJobArguments(job)
    })
  },
  renderJobArguments (job) {
    const tJob = this.model
    const argsdefs = tJob.task.task_arguments.models
    const inputs = job.task_arguments_values
    //const data = []

    this.el.appendChild(dateElem(tJob.creation_date))

    if (argsdefs.length > 0) {
      for (let index = 0; index < argsdefs.length; index++) {
        //const def = argsdefs[index]
        let col = document.createElement('div')
        if (inputs[index].includes('base64')) {
          const dwld = new DownloadButton({ blob: inputs[index] })
          this.renderSubview(dwld, col)
        } else {
          col.innerHTML = inputs[index]
        }
        this.el.appendChild(col)
      }
    }

    // round 2 decimal
    const cols = Math.round(100 / (argsdefs.length + 1) * 1e1) / 1e1
    const colStyle = `grid-template-columns: repeat(auto-fill, minmax(${cols}%, 1fr))`
    this.el.setAttribute('style', colStyle)
  }
})

const TableRow = JobRow.extend({
  derived: null,
  bindings: null,
  render () {
    this.renderWithTemplate(this)
    const table = new InputsView({ model: this.model })
    const el = this.queryByHook('title')
    this.renderSubview(table, el)
    this.renderButtons()
  }
})

const CollapsedContentView = View.extend({
  template: `<div></div>`,
  render () {
    this.renderWithTemplate(this)

    this.jobsScheduler = new SchedulesView({ model: this.model })
    this.renderSubview(this.jobsScheduler, this.el)

    this.jobsList = new JobsList({
      model: this.model,
      rowView: this.model.table_view ? TableRow : JobRow
    })
    this.renderSubview(this.jobsList, this.el)

    this.jobsPaginator = new JobsPaginator({ model: this.model })
    this.renderSubview(this.jobsPaginator, this.el)
  }
})

const TaskButtonsView = View.extend({
  template: `
    <div>
      <span data-hook="edit-button"> </span>
      <span data-hook="edit-script"> </span>
      <span data-hook="copy-button"> </span>
      <span data-hook="delete-button"> </span>
      <span data-hook="export-button"> </span>
      <li>
        <button class="btn btn-primary" title="Workflow" data-hook="workflow">
          <i class="fa fa-sitemap dropdown-icon" aria-hidden="true"></i>
          <span>Show workflow</span>
        </button>
      </li>
      <li>
        <button data-hook="search" class="btn btn-primary" title="Search related elements">
          <i class="fa fa-search dropdown-icon" aria-hidden="true"></i>
          <span>Search related</span>
        </button>
      </li>
      <span data-hook="integration-button"> </span>
      <span data-hook="refresh-button"> </span>
    </div>
  `,
  events: {
    'click button[data-hook=search]':'onClickSearch',
    'click button[data-hook=workflow]':'onClickWorkflow',
  },
  onClickWorkflow (event) {
    event.stopPropagation()
    event.preventDefault()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    App.actions.task.nodeWorkflow(this.model.id)
    return false
  },
  onClickSearch (event) {
    event.preventDefault()
    event.stopPropagation()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    SearchActions.search(this.model.name)
    return false
  },
  render () {
    this.renderWithTemplate(this)

    if (Acls.hasAccessLevel('admin')) {
      var editButton = new EditTaskButton({ model: this.model })
      this.renderSubview(editButton, this.queryByHook('edit-button'))

      var integrationButton = new TaskIntegrationButton({ model: this.model })
      this.renderSubview(integrationButton, this.queryByHook('integration-button'))

      if (this.model._type === 'ScriptTask') {
        var editScriptButton = new EditScriptButton({ model: this.model })
        this.renderSubview(editScriptButton, this.queryByHook('edit-script'))
      }

      var copyButton = new CopyTaskButton({ model: this.model })
      this.renderSubview(copyButton, this.queryByHook('copy-button'))

      var exportButton = new ExportTaskButton({ model: this.model })
      this.renderSubview(exportButton, this.queryByHook('export-button'))

      var deleteButton = new DeleteTaskButton({ model: this.model })
      this.renderSubview(deleteButton, this.queryByHook('delete-button'))
    }

    this.renderSubview(new ReviewPendingTaskButton({ model: this.model }), this.queryByHook('refresh-button'))

  }
})

const EditScriptButton = View.extend({
  template: `
    <li>
      <button class="btn btn-primary" title="Edit Script" data-hook="edit-script">
        <i class="fa fa-code" aria-hidden="true"></i>
        <span>Edit Script</span>
      </button>
    </li>
  `,
  events: {
    'click button':'onClickButton',
  },
  onClickButton (event) {
    event.preventDefault()
    event.stopPropagation()
    if (!this.model.script_id) { return }
    App.actions.file.edit(this.model.script_id)
    return false
  }
})
