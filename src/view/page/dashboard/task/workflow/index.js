import App from 'ampersand-app'
import Acls from 'lib/acls'
import View from 'ampersand-view'
import EditWorkflowButton from 'view/page/workflow/edit-button'
import WorkflowActions from 'actions/workflow'
import CollapsibleRow from '../collapsible-row'
import ExecButton from '../exec-button'
import TaskRowView from '../task'

module.exports = CollapsibleRow.extend({
  derived: {
    hostname: {
      fn: () => ''
    },
    type: {
      fn: () => 'workflow'
    },
    type_icon: {
      fn: () => 'fa fa-sitemap'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-sitemap workflow-color'
    }
  },
  onClickToggleCollapse (event) {
    WorkflowActions.populate(this.model)
    return
  },
  renderCollapsedContent () {
    this.renderCollection(
      this.model.tasks,
      TaskRowView,
      this.queryByHook('collapse-container-body')
    )
  },
  renderButtons () {
    this.renderSubview(
      new WorkflowButtonsView({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )

    if (Acls.hasAccessLevel('user')) {
      const button = this.renderSubview(
        new ExecWorkflowButton({ model: this.model }),
        this.queryByHook('execute-button-container')
      )
    }
  }
})

const ExecWorkflowButton = ExecButton.extend({
  render () {
    ExecButton.prototype.render.apply(this, arguments)
    this.listenToAndRun(this.model,'change:lifecycle',() => { })
  },
  onClickExecute (event) {
    event.stopPropagation()
    event.preventDefault()

    WorkflowActions.triggerExecution(this.model)
  }
})

const WorkflowButtonsView = View.extend({
  template: ` <div> <span data-hook="edit-button"> </span> </div> `,
  render () {
    this.renderWithTemplate(this)

    if (Acls.hasAccessLevel('admin')) {
      var button = new EditWorkflowButton({ model: this.model })
      this.renderSubview(button, this.queryByHook('edit-button'))
    }
  }
})
