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
import SearchBox from 'components/searchbox'

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

    this.listenToAndRun(this.model, 'change:table_view', () => {
      if (this.jobsList) {
        this.jobsList.remove()
      }

      this.jobsList = this.renderSubview(
        new WorkflowJobsListView({ model: this.model }),
        this.queryByHook('collapse-container-body')
      )
    })
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
    this.jobsCollectionView = this.renderCollection(
      this.model.jobs,
      this.model.table_view ? WorkflowJobInputsView : WorkflowJobDateView,
      this.queryByHook('jobs-list'),
      {
        reverse: true,
        emptyView: EmptyJobView
      }
    )
  },
  renderJobsSearchBox () {
    const search = new SearchBox()
    this.renderSubview(search, this.queryByHook('header-title'))
    this.listenTo(search, 'change:input_value', () => {
      const collectionView = this.jobsCollectionView
      const value = search.input_value
      if (!value) {
        collectionView.views.forEach(view => view.el.style.display = 'block')
      } else {
        collectionView.views.forEach(view => {
          const workflowJob = view.model
          const jobs = workflowJob.jobs

          const matchedJobs = jobs.filter(job => {
            const matchedArgs = job.task_arguments_values.filter(arg => {
              const pattern = new RegExp(value,'i')
              return pattern.test(arg)
            })

            return ( matchedArgs.length > 0 )
          })

          if (matchedJobs.length === 0) {
            view.el.style.display = 'none'
          } else {
            // highligth matched element
          }
        })
      }
    })
  }
})

const WorkflowJobRowView = CollapsibleRow.extend({
  template: `
    <div title="" data-hook="root" data-component="workflow-collapsible-row" class="workflow-job-row">
      <div class="panel panel-default">
        <div class="panel-heading"
          role="tab"
          data-hook="panel-heading">
  
      <!-- Collapse Heading Container { -->
          <h4 class="panel-title-icon"><i data-hook="header-icon"></i></h4>
          <h4 class="panel-title">
            <div class="collapsed"
              data-hook="collapse-toggle"
              data-toggle="collapse"
              data-parent="#task-accordion"
              href="#unbinded"
              aria-expanded="false"
              aria-controls="unbinded">

              <section data-hook="icons-container"></section>
              <section class="panel-title-content" data-hook="row-container"> </section>
            </div>
          </h4>
        </div>
      <!-- } END Collapse Heading Container -->

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
        return ''
        //let mdate = moment(this.model.creation_date)
        //let text = mdate.format('D-MMM-YY, HH:mm:ss')
        //return text
      }
    },
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
      this.queryByHook('icons-container')
    )
  },
  renderCollapsedContent () {
    this.renderSubview(
      new JobsList({
        model: this.model,
        rowView: TaskJobInputsRow,
        renderHeader: false
      }),
      this.queryByHook('collapse-container-body'),
    )
  },
  renderHelp () {
    // no help required
    return
  },
  bindings: Object.assign({}, CollapsibleRow.prototype.bindings, {
    'model.id': {
      hook: 'root',
      type: 'attribute',
      name: 'title'
    }
  })
})

const WorkflowJobDateView = WorkflowJobRowView.extend({
  render () {
    WorkflowJobRowView.prototype.render.apply(this, arguments)

    let header = new DateView({ model: this.model })
    const container = this.queryByHook('row-container')
    this.renderSubview(header, container)
  },
})

const WorkflowJobInputsView = WorkflowJobRowView.extend({
  render () {
    WorkflowJobRowView.prototype.render.apply(this, arguments)

    let header = new InputsView({ model: this.model })
    const container = this.queryByHook('row-container')
    this.renderSubview(header, container)
  },
})

const TaskJobInputsRow = TaskJobRow.extend({
  bindings: {
    row_title: { type: 'innerHTML', hook: 'title' }
  },
  derived: {
    row_title: {
      deps: ['model.creation_date','model.name'],
      fn () {
        const job = this.model
        const date = moment(job.creation_date).format('DD-MM-YY HH:mm:ss')
        const name = job.name
        return `<span>${date}</span> | ${name}`
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
    <div data-component="workflow-job-exec-button">
      <i data-hook="lifecycle_icon"></i>
      <i data-hook="progress_icon"></i>
    </div>
  `
})

const InputsView = View.extend({
  props: { 
    data: 'object'
  },
  template: `<div data-component="inputs-row"></div>`,
  render () {
    this.renderWithTemplate(this)

    this.listenToAndRun(this.model, 'change:first_job', () => {
      const job = this.model.first_job
      if (!job) return
      this.renderJobArguments(job)
    })
  },
  renderJobArguments (job) {
    const wfJob = this.model
    if (job.task) {
      const argsdefs = job.task.task_arguments.models
      const inputs = job.task_arguments_values
      //const data = []

      this.el.appendChild( dateElem(wfJob.creation_date) )

      if (argsdefs.length > 0) {
        for (let index = 0; index < argsdefs.length; index++) {
          //const def = argsdefs[index]
          let col = document.createElement('div')
          col.innerHTML = inputs[ index ]
          this.el.appendChild( col )
        }
      }

      // round 2 decimal
      const cols = Math.round( 100 / (argsdefs.length + 1) * 1e1 ) / 1e1
      const colStyle = `grid-template-columns: repeat(auto-fill, minmax(${cols}%, 1fr))`
      this.el.setAttribute('style', colStyle)
    }
  }
})

const DateView = View.extend({
  template: `<div data-component="inputs-row"></div>`,
  render () {
    this.renderWithTemplate(this)
    this.el.appendChild( dateElem(this.model.creation_date) )
  }
})

/**
 * @param {Date/String}
 * @return {DOMElem}
 */
const dateElem = (date) => {
  let col = document.createElement('div')
  col.innerHTML = moment(date).format('DD-MM-YYYY HH:mm:ss')
  return col
}
