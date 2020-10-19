import App from 'ampersand-app'
import Acls from 'lib/acls'
import View from 'ampersand-view'
import CollapsibleRow from '../collapsible-row'
import ExecButton from '../exec-button'
import TaskJobRow from '../task/collapse/job'
import JobExecButton from '../task/collapse/job/job-exec-button'
import EmptyJobView from '../empty-job-view'
import moment from 'moment'
import JobsList from 'view/page/dashboard/task/jobs-list'

// menu buttons
import RemoveWorkflowButton from 'view/page/workflow/buttons/remove'
import EditWorkflowButton from 'view/page/workflow/buttons/edit'
import ViewWorkflowButton from 'view/page/workflow/buttons/view'
import IntegrationsWorkflowButton from 'view/page/workflow/buttons/integrations'
import ScheduleButton from 'view/buttons/schedule'
import SchedulesView from 'view/page/task/schedules'

import './styles.less'

export default CollapsibleRow.extend({
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
    App.actions.workflow.populate(this.model)
  },
  renderCollapsedContent () {
    this.renderSubview(
      new SchedulesView({ model: this.model }),
      this.queryByHook('collapse-container-body'),
    )

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
    <div data-component="workflow-collapsible-row" class="workflow-job-row">
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
              <div class="panel-title-content" data-hook="panel-container">
                <span class="panel-item name">
                  <span data-hook="name" title=""></span>
                </span>
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
      this.queryByHook('panel-container')
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
    App.actions.workflow.triggerExecution(this.model)
    return false
  }
})

const WorkflowButtonsView = View.extend({
  template: `<div data-hook="buttons"></div>`,
  render () {
    this.renderWithTemplate(this)
    const buttons = this.queryByHook('buttons')

    this.renderSubview(new ViewWorkflowButton({ model: this.model }), buttons)

    // edit comes before view
    if (Acls.hasAccessLevel('admin')) {
      this.renderSubview(new EditWorkflowButton({ model: this.model }), buttons)
      this.renderSubview(new IntegrationsWorkflowButton({ model: this.model }), buttons)
      this.renderSubview(new RemoveWorkflowButton({ model: this.model }), buttons)
      this.renderSubview(new ScheduleButton({ model: this.model }), buttons)
    }
  }
})

const WorkflowJobStatus = JobExecButton.extend({
  template: `
    <div data-component="job-exec-button" class="panel-item icons">
      <li class="static-icons">
        <i data-hook="execution_lifecycle_icon"></i>
        <i data-hook="execution_progress_icon"></i>
      </li>
    </div>
  `
})
