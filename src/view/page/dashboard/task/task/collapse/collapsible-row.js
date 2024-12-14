import App from 'ampersand-app'
import View from 'ampersand-view'
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
import $ from 'jquery'
import JobRow from './job'
import JobsList from 'view/page/dashboard/task/jobs-list'
import { JobsPaginator } from 'view/page/paginator/footer'

export default CollapsibleRow.extend({
  onClickToggleCollapse (event) {
    this.loadingContent = true
    this.listenTo(this.model, 'change:is_loading', () => {
      if (this.model.is_loading === false) {
        this.loadingContent = false
        this.stopListening(this.model, 'change:is_loading')
      }
    })

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

const CollapsedContentView = View.extend({
  template: `<div></div>`,
  render () {
    this.renderWithTemplate(this)

    this.jobsScheduler = new SchedulesView({ model: this.model })
    this.renderSubview(this.jobsScheduler, this.el)

    this.jobsList = new JobsList({ model: this.model, rowView: JobRow })
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
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    if (!this.model.script_id) { return }
    App.actions.file.edit(this.model.script_id)
    return false
  }
})
