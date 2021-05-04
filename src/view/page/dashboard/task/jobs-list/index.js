import App from 'ampersand-app'
import View from 'ampersand-view'
import DeleteJobsButton from 'view/page/dashboard/task/delete-jobs-button'
import EmptyJobView from '../empty-job-view'
import Acls from 'lib/acls'
import './styles.less'
import Collection from 'ampersand-collection'

const LIMIT_COUNTER = 20

export default View.extend({
  template: `
    <div data-component="jobs-list-component">
      <div data-hook="header-container" class="header-container">
        <h3>
          <div class="buttons-container">
            <span class="delete-jobs-button" data-hook="delete-jobs-button"> </span>
          </div>
          <div class="header-title" data-hook="header-title"></div>
        </h3>
      </div>
      <div data-hook="jobs-list"></div>
      <div data-hook="jobs-paginator"></div>
    </div>
  `,
  bindings: {
    renderHeader: {
      type: 'toggle',
      hook: 'header-container'
    },
    headerTitle: [
      {
        type: 'text',
        hook: 'header-title'
      },
      {
        type: 'toggle',
        hook: 'header-title'
      }
    ]
  },
  props: {
    headerTitle: ['string', false, 'Execution history'],
    rowView: 'any',
    renderHeader: ['boolean', false, true ],
    jobs: 'collection',
    listLength: ['number', false, LIMIT_COUNTER]
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)
    this.jobs = new Collection()
    this.listenStateChanges()
  },
  listenStateChanges () {
    this.listenTo(this.model.jobs, 'add', this.updateJobsState('add'))
    this.listenTo(this.model.jobs, 'sync', this.updateJobsState('sync'))
    this.listenTo(this.model.jobs, 'reset', this.updateJobsState('reset'))
    this.listenTo(this.model.jobs, 'remove', this.updateJobsState('remove'))

    this.listenToAndRun(App.state.localSettings, 'change:jobsListLength', () => {
      this.listLength = App.state.localSettings.jobsListLength || LIMIT_COUNTER
      this.updateJobsState('reset')(this.model.jobs)
    })
  },
  updateJobsState (eventName) {
    return (model) => {
      const availableJobs = this.model.jobs

      if (eventName === 'add') {
        if (this.jobs.length < this.listLength) {
          this.jobs.add(model)
        }
      }

      if (eventName === 'remove') {
        this.jobs.remove(model.id)
        if (availableJobs.length >= this.listLength) {
          let replaced = false
          for (let index = 0; index < this.listLength && !replaced; index++) {
            const job = availableJobs.models[index]
            if (!this.jobs.get(job.id)) {
              this.jobs.add(job)
              replaced = true
            }
          }
        }
      }

      if (eventName === 'sync' || eventName === 'reset') {
        this.jobs.reset([])
        if (availableJobs.length >= this.listLength) {
          for (let index = 0; index < this.listLength; index++) {
            const job = availableJobs.models[index]
            this.jobs.add(job)
          }
        } else {
          this.jobs.reset(this.model.jobs.models)
        }
      }
    }
  },
  render () {
    this.renderWithTemplate()

    if (Acls.hasAccessLevel('admin')) {
      let deleteJobsButton = new DeleteJobsButton({ model: this.model })
      this.renderSubview(deleteJobsButton, this.queryByHook('delete-jobs-button'))
      this.listenToAndRun(this.model.jobs, 'add sync reset remove', () => {
        if (this.model.jobs.length) {
          deleteJobsButton.disabled = false
        } else {
          deleteJobsButton.disabled = true
        }
      })
    }

    this.renderJobsPagination()
    this.renderJobs()
    this.renderJobsSearchBox()
  },
  renderJobs () {
    if (this.jobsView) {
      this.jobsView.remove()
    }

    this.jobsView = this.renderCollection(
      this.jobs,
      this.rowView,
      this.queryByHook('jobs-list'),
      {
        reverse: true,
        emptyView: EmptyJobView
      }
    )
  },
  renderJobsSearchBox () {
    // not implemented for tasks
  },
  renderJobsPagination () {
    this.renderSubview(
      new PaginatorView({ model: this.model }),
      this.queryByHook('jobs-paginator')
    )
  }
})

const PaginatorView = View.extend({
  props: {
    listLength: ['number', false, LIMIT_COUNTER],
    jobsLength: ['number', false, 0],
  },
  template: `
    <div data-component="paginator">
      <div>
        <span data-hook="jobs-count"></span>
        <select class="select right">
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  `,
  bindings: {
    count: {
      hook:'jobs-count'
    }
  },
  events: {
    'change select':'onSelectChange'
  },
  onSelectChange (event) {
    const el = this.query('select')
    App.actions.localSettings.update('jobsListLength', Number(el.value))
  },
  initialize () {
    this.listenToAndRun(App.state.localSettings, 'change:jobsListLength', () => {
      this.listLength = App.state.localSettings.jobsListLength || LIMIT_COUNTER
    })

    // update collection length
    this.listenToAndRun(this.model.jobs, 'add remove sync reset', () => {
      this.jobsLength = this.model.jobs.length
    })
  },
  derived: {
    count: {
      deps: ['jobsLength','listLength'],
      fn () {
        if (this.jobsLength >= this.listLength) {
          return `${this.listLength}/${this.jobsLength}`
        } else {
          return this.jobsLength
        }
      }
    }
  }
})
