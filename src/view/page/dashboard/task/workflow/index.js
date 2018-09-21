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
import DeleteJobsButton from 'view/page/dashboard/task/delete-jobs-button'
import EmptyJobView from '../empty-job-view.js'
import moment from 'moment'

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
  initialize () {
    CollapsibleRow.prototype.initialize.apply(this, arguments)

    this.collapse_title = 'Execution history'
  },
  onClickToggleCollapse (event) {
    WorkflowActions.populate(this.model)
  },
  renderCollapsedContent () {
    this.renderCollection(
      this.model.jobs,
      WorkflowJobRowView,
      this.queryByHook('collapse-container-body'),
      {
        reverse: true,
        emptyView: EmptyJobView
      }
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

    if (Acls.hasAccessLevel('admin')) {
      var deleteJobsButton = new DeleteJobsButton({ model: this.model })
      this.renderSubview(deleteJobsButton, this.queryByHook('delete-jobs-button'))

      this.listenToAndRun(this.model.jobs, 'add sync reset remove', () => {
        if (this.model.jobs.length) {
          deleteJobsButton.disabled = false
        } else {
          deleteJobsButton.disabled = true
        }
      })
    }
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
  renderCollapsedContent () {
    const jobRows = this.renderCollection(
      this.model.jobs,
      TaskJobDescriptiveRow,
      this.queryByHook('collapse-container-body')
      //{
      //  reverse: true
      //}
    )
  },
  renderButtons () {
    this.renderSubview(
      new WorkflowJobStatus({ model: this.model }),
      this.queryByHook('job-status-container')
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
