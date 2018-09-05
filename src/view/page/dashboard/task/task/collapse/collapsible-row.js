import TaskActions from 'actions/task'
import View from 'ampersand-view'
import SearchActions from 'actions/searchbox'
import ExecTaskButton from '../task-exec-button'
import EditTaskButton from 'view/page/task/buttons/edit'
import CopyTaskButton from 'view/page/task/buttons/copy'
import DeleteTaskButton from 'view/page/task/buttons/delete'
import CollapsibleRow from 'view/page/dashboard/task/collapsible-row'
import acls from 'lib/acls'
import $ from 'jquery'

module.exports = CollapsibleRow.extend({
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

const TaskButtonsView = View.extend({
  template: `
    <div>
      <li>
        <button class="btn btn-primary" title="Workflow" data-hook="workflow">
          <i class="fa fa-sitemap dropdown-icon" aria-hidden="true"></i>
          <span>View workflow</span>
        </button>
      </li>
      <span data-hook="edit-button"> </span>
      <span data-hook="copy-button"> </span>
      <span data-hook="delete-button"> </span>
      <li>
        <button data-hook="recipe" class="btn btn-primary" title="Export this task recipe">
          <i class="fa fa-file-code-o dropdown-icon" aria-hidden="true"></i>
          <span>Export recipe</span>
        </button>
      </li>
      <li>
        <button data-hook="search" class="btn btn-primary" title="Search related elements">
          <i class="fa fa-search dropdown-icon" aria-hidden="true"></i>
          <span>Search related</span>
        </button>
      </li>
    </div>
  `,
  events: {
    'click button[data-hook=search]':'onClickSearch',
    'click button[data-hook=workflow]':'onClickWorkflow',
    'click button[data-hook=recipe]':'onClickRecipe',
  },
  onClickRecipe (event) {
    event.stopPropagation()
    event.preventDefault()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    TaskActions.exportRecipe(this.model.id)
    return false
  },
  onClickWorkflow (event) {
    event.stopPropagation()
    event.preventDefault()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    TaskActions.nodeWorkflow(this.model.id)
    return false;
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

    if (acls.hasAccessLevel('admin')) {
      var editButton = new EditTaskButton({ model: this.model })
      this.renderSubview(editButton, this.queryByHook('edit-button'))

      var copyButton = new CopyTaskButton({ model: this.model })
      this.renderSubview(copyButton, this.queryByHook('copy-button'))

      var deleteButton = new DeleteTaskButton({ model: this.model })
      this.renderSubview(deleteButton, this.queryByHook('delete-button'))
    }
  }
})
