import moment from 'moment'
import App from 'ampersand-app'
import Acls from 'lib/acls'
import View from 'ampersand-view'
import CollapsibleRow from '../collapsible-row'
import ExecButton from '../exec-button'
import TaskJobRow from '../task/collapse/job'
import JobExecButton from '../task/collapse/job/job-exec-button'
import EmptyJobView from '../empty-job-view'
import SearchBox from 'components/searchbox'
import JobsList from 'view/page/dashboard/task/jobs-list'
import JobsPaginator from 'view/page/paginator/footer'

// menu buttons
import RemoveWorkflowButton from 'view/page/workflow/buttons/remove'
import EditWorkflowButton from 'view/page/workflow/buttons/edit'
import CopyWorkflowButton from 'view/page/workflow/buttons/copy'
import ReviewPendingWorkflowsButton from 'view/page/workflow/buttons/refresh'
import ViewWorkflowButton from 'view/page/workflow/buttons/view'
import ExportWorkflowButton from 'view/page/workflow/buttons/export'
import IntegrationsWorkflowButton from 'view/page/workflow/buttons/integrations'
import ScheduleButton from 'view/buttons/schedule'
import SchedulesView from 'view/page/task/schedules'
import { ExecTask as ExecTaskView } from 'view/page/dashboard/task/task/exec-task.js'

import DownloadButton from 'view/buttons/download'

import './styles.less'

export default CollapsibleRow.extend({
  props: {
    inputs_fetched: 'boolean'
  },
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
    },
    /* ------------ TODO: New workflow icon ------------ */
    // image: {
    //   deps: ['model.image'],
    //   fn () {
    //     if (this.model.image) return this.model.image
    //     else return '/images/approval.png'
    //   }
    // }
  },
  onClickToggleCollapse (event) {
    const workflow = this.model
    App.actions.workflow.fetchJobs(workflow)

    if (workflow.table_view === true) {
      this.tableViewDataFetch()
    }
  },
  tableViewDataFetch () {
    const workflow = this.model

    if (this.inputs_fetched === true) { return }

    const loader = this.queryByHook('collapse-container-body-loader')
    const content = this.queryByHook('collapse-container-body')

    loader.style.display = 'block'
    content.style.display = 'none'
    this.on('change:loadingContent', () => {
      if (this.loadingContent !== true) {
        loader.style.display = 'none'
        content.style.display = 'block'
      //} else {
      //  loader.style.display = 'block'
      //  content.style.display = 'none'
      }
    })

    // fetch inputs
    this.listenToAndRun(workflow, 'change:jobsAlreadyFetched', () => {
      if (workflow.jobsAlreadyFetched) {
        this.loadingContent = true
        this.listenTo(workflow, 'change:is_loading', () => {
          if (workflow.is_loading === false) {
            this.inputs_fetched = true
            this.loadingContent = false
            this.stopListening(workflow, 'change:is_loading')
          }
        })

        App.actions.workflow.fetchJobsInputs(workflow)
      }
    })
  },
  renderCollapsedContent () {
    this.collapsedContent = new WorkflowCollapsedContent({ model: this.model })
    this.renderSubview(
      this.collapsedContent,
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

const WorkflowCollapsedContent = View.extend({
  template: `<div></div>`,
  render() {
    this.renderWithTemplate(this)

    if (Acls.hasAccessLevel('admin')) {
      this.jobsScheduler = new SchedulesView({ model: this.model })
      this.renderSubview(this.jobsScheduler, this.el)
    }

    this.jobsList = new WorkflowJobsListView({ model: this.model })
    this.renderSubview(this.jobsList, this.el)

    this.jobsPaginator = new JobsPaginator({ model: this.model })
    this.renderSubview(this.jobsPaginator, this.el)
  }
})

const WorkflowJobsListView = JobsList.extend({
  renderJobs () {
    (this.jobsCollectionView && this.jobsCollectionView.remove())

    this.jobsCollectionView = this.renderCollection(
      this.jobs,
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
  renderCollapsedContent (event) {
    this.collapsedContent = new WorkflowJobCollapsedContentView({ model: this.model })
    this.renderSubview(
      this.collapsedContent,
      this.queryByHook('collapse-container-body')
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

const WorkflowJobCollapsedContentView = View.extend({
  template: `<div></div>`,
  render () {
    this.renderWithTemplate(this)

    this.jobsList = new JobsList({
      model: this.model,
      rowView: TaskJobInputsRow,
      renderHeader: false
    })

    this.renderSubview(this.jobsList, this.el)
  }
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
    const task = this.model.start_task
    const execTask = new ExecTaskView({ model: task })
    execTask.execute()
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
      this.renderSubview(new CopyWorkflowButton({ model: this.model }), buttons)
      this.renderSubview(new ExportWorkflowButton({ model: this.model }), buttons)
      this.renderSubview(new IntegrationsWorkflowButton({ model: this.model }), buttons)
      this.renderSubview(new RemoveWorkflowButton({ model: this.model }), buttons)
      this.renderSubview(new ScheduleButton({ model: this.model }), buttons)
    }
    this.renderSubview(new ReviewPendingWorkflowsButton({ model: this.model }), buttons)
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
  template: `<div data-component="inputs-row"></div>`,
  render () {
    let contentView
    this.renderWithTemplate(this)
    this.listenToAndRun(this.model, 'change:first_job', () => {
      const job = this.model.first_job
      if (!job) { return }
      this.listenToAndRun(job, 'change:task change:task_arguments_values', () => {
        // render a new one
        if (contentView) { contentView.remove() }
        contentView = new InputsContentView({ model: this.model })

        this.renderSubview(contentView)
      })
    })
  }
})

const InputsContentView = View.extend({
  template: `<div class="inputs-row-content"></div>`,
  render () {
    this.renderWithTemplate(this)

    const wfJob = this.model
    const job = this.model.first_job

    if (job.task?.task_arguments && Array.isArray(job.task_arguments_values)) {

      const argsdefs = job.task.task_arguments.models
      const inputs = job.task_arguments_values
      //const data = []

      this.el.appendChild(dateElem(wfJob.creation_date))

      if (argsdefs.length > 0) {
        for (let index = 0; index < argsdefs.length; index++) {
          const col = document.createElement('div')
          const arg = argsdefs[index]
          const value = inputs[index]

          if (arg.type === 'file') {
            this.renderSubview(new DownloadButton({ value }), col)
          } else {
            col.innerHTML = (value||'')
          }

          this.el.appendChild(col)
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
  template: `
    <div data-component="inputs-row">
      <div class="inputs-row-content" data-hook="inputs-row-content"></div>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)
    this
      .queryByHook("inputs-row-content")
      .appendChild( dateElem(this.model.creation_date) )
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
