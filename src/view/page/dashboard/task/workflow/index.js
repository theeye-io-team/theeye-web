import App from 'ampersand-app'
import Acls from 'lib/acls'
import View from 'ampersand-view'
import EditWorkflowButton from 'view/page/workflow/edit-button'
import ViewWorkflowButton from 'view/page/workflow/view-button'
import WorkflowActions from 'actions/workflow'
import CollapsibleRow from '../collapsible-row'
import ExecButton from '../exec-button'
import TaskJobRow from '../task/collapse/job'
import JobExecButton from '../task/collapse/job/job-exec-button'
import EmptyJobView from '../empty-job-view'
import moment from 'moment'
import JobsList from 'view/page/dashboard/task/jobs-list'

import './styles.less'

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
    this.renderSubview(
      new WorkflowJobsListView({ model: this.model }),
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

const WorkflowJobsListView = JobsList.extend({
  renderJobs () {
    this.renderCollection(
      this.model.jobs,
      WorkflowJobRowView,
      this.queryByHook('jobs-list'),
      {
        reverse: true,
        emptyView: EmptyJobView
      }
    )
  }
})

const WorkflowJobRowView = CollapsibleRow.extend({
  template: `
    <div class="workflow-job-row">
      <div class="panel panel-default">
        <div class="panel-heading"
          role="tab"
          data-hook="panel-heading"> <!-- Collapse Heading Container { -->
          <h4 class="panel-title-icon"><i data-hook="header-icon"></i></h4>
          <h4 class="panel-title">
            <span class="collapsed"
              data-hook="collapse-toggle"
              data-toggle="collapse"
              data-parent="#task-accordion"
              href="#unbinded"
              aria-expanded="false"
              aria-controls="unbinded">
              <div class="panel-title-content">
                <span class="panel-item name">
                  <span data-hook="name" title=""></span>
                </span>
                <div data-hook="job-status-container" class="panel-item icons">
                </div>
              </div>
            </span>
          </h4>
        </div> <!-- } END Collapse Heading Container -->

        <!-- Collapsed Container { -->
        <div data-hook="collapse-container"
          id="unbinded"
          class="panel-collapse collapse"
          aria-labelledby="unbinded"
          role="tabpanel">
          <div class="panel-body" data-hook="collapse-container-body"> </div>
        </div>
        <!-- } END Collapsed Container -->
      </div>
    </div>
  `,
  derived: {
    row_text: {
      deps: ['model.creation_date'],
      fn () {
        if (!this.model.user) { return '' }

        let mdate = moment(this.model.creation_date)
        let uname = this.model.user.username

        let text = [
          uname,
          ' ran on ',
          mdate.format('D-MMM-YY, HH:mm:ss'),
        ].join('')
        return text
      }
    },
    //type_icon: {
    //},
    header_type_icon: {
      deps: ['collapsed'],
      fn () {
        let icon = 'fa fa-chevron-right rotate'
        if (!this.collapsed) {
          icon += ' rotate-90'
        }
        return icon
      }
    }
  },
  renderButtons () {
    this.renderSubview(
      new WorkflowJobStatus({ model: this.model }),
      this.queryByHook('job-status-container')
    )
  },
  renderCollapsedContent () {
    this.renderSubview(
      new JobsList({
        model: this.model,
        rowView: TaskJobDescriptiveRow,
        renderHeader: false
      }),
      this.queryByHook('collapse-container-body'),
    )
  },
  renderHelp () {
    // no help required
    return
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
  template: `
    <div>
      <span data-hook="view-button"></span>
      <span data-hook="edit-button"></span>
    </div>`,
  render () {
    this.renderWithTemplate(this)

    let viewButton = new ViewWorkflowButton({ model: this.model })
    this.renderSubview(viewButton, this.queryByHook('view-button'))

    if (Acls.hasAccessLevel('admin')) {
      let editButton = new EditWorkflowButton({ model: this.model })
      this.renderSubview(editButton, this.queryByHook('edit-button'))
    }
  }
})

const WorkflowJobStatus = JobExecButton.extend({
  template: `
    <div class="job-status-icon">
      <i data-hook="job_lifecycle"></i>
    </div>
  `
})
