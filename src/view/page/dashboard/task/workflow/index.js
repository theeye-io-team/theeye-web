import App from 'ampersand-app'
import Acls from 'lib/acls'
import View from 'ampersand-view'
import EditWorkflowButton from 'view/page/workflow/edit-button'
import WorkflowActions from 'actions/workflow'
import CollapsibleRow from '../collapsible-row'
import ExecButton from '../exec-button'
import TaskJobRow from '../task/collapse/job'
import moment from 'moment'

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
  },
  renderCollapsedContent () {
    this.renderCollection(
      this.model.jobs,
      WorkflowJobRowView,
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

const WorkflowJobRowView = CollapsibleRow.extend({
  derived: {
    row_text: {
      deps: ['model.creation_date'],
      fn () {
        if (!this.model.user) { return '' }

        let mdate = moment(this.model.creation_date)
        let uname = this.model.user.username

        let text = [
          uname,
          ' executed on ',
          mdate.format('MMMM Do YYYY, HH:mm:ss Z'),
        ].join('')
        return text
      }
    },
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
  renderCollapsedContent () {
    const jobRows = this.renderCollection(
      this.model.jobs,
      TaskJobDescriptiveRow,
      this.queryByHook('collapse-container-body'),
      {
        reverse: true
      }
    )
  }
})

const TaskJobDescriptiveRow = TaskJobRow.extend({
  derived: {
    row_title: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    }
  }
})

const ExecWorkflowButton = ExecButton.extend({
  onClick (event) {
    event.stopPropagation()
    event.preventDefault()
    WorkflowActions.triggerExecution(this.model)
    return false
  }
})

const WorkflowButtonsView = View.extend({
  template: `<div><span data-hook="edit-button"></span></div>`,
  render () {
    this.renderWithTemplate(this)

    if (Acls.hasAccessLevel('admin')) {
      var button = new EditWorkflowButton({ model: this.model })
      this.renderSubview(button, this.queryByHook('edit-button'))
    }
  }
})
