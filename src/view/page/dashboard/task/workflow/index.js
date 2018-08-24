import App from 'ampersand-app'
import Acls from 'lib/acls'
import View from 'ampersand-view'
import EditWorkflowButton from 'view/page/workflow/edit-button'
import WorkflowActions from 'actions/workflow'
import CollapsibleRow from '../collapsible-row'
import ExecButton from '../exec-button'
import TaskJobRow from '../task/collapse/job'
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
  onClickToggleCollapse (event) {
    WorkflowActions.populate(this.model)
  },
  renderCollapsedContent () {
    this.renderCollection(
      this.model.jobs,
      WorkflowJobRowView,
      this.queryByHook('collapse-container-body'),
      {
        reverse: true
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
          icon += ' rotate-down'
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
