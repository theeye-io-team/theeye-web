import App from 'ampersand-app'
import Acls from 'lib/acls'
import View from 'ampersand-view'
import CollapsibleRow from './collapsible-row'
import ExecButton from './exec-button'
import EditWorkflowButton from 'view/page/workflow/edit-button'
import WorkflowActions from 'actions/workflow'
import TaskRowView from './task'

module.exports = CollapsibleRow.extend({
  template: require('./row.hbs'),
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return this.model.hostname || 'Hostname not assigned'
      }
    },
    type: {
      deps: ['model._type'],
      fn () {
        return 'workflow'
      }
    },
    type_icon: {
      deps: ['model._type'],
      fn () {
        return 'fa fa-sitemap'
      }
    },
    header_type_icon: {
      deps: ['model._type'],
      fn () {
        return 'circle fa fa-sitemap'
      }
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
      this.query('div[data-hook=buttons-container]')
    )
    this.renderSubview(
      new WorkflowButtonsView({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )

    //if (Acls.hasAccessLevel('user')) {
    //  const button = this.renderSubview(
    //    new ExecButton({ model: this.model }),
    //    this.queryByHook('execute-button-container')
    //  )
    //}
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
