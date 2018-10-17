import View from 'ampersand-view'
import DeleteJobsButton from 'view/page/dashboard/task/delete-jobs-button'
import EmptyJobView from '../empty-job-view'
import Acls from 'lib/acls'
import './styles.less'

module.exports = View.extend({
  template: `
  <div class="col-xs-12 jobs-list-component">
    <div data-hook="header-container" class="header-container">
      <h3>
        <span data-hook="header-title"></span>
        <div class="buttons-container">
          <span class="delete-jobs-button" data-hook="delete-jobs-button"> </span>
        </div>
      </h3>
    </div>
    <div data-hook="jobs-list"></div>
  </div>
  `,
  props: {
    headerTitle: ['string', false, 'Execution history'],
    rowView: 'function',
    renderHeader: ['boolean', false, true ]
  },
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
  render () {
    this.renderWithTemplate()

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

    this.renderJobs()
  },
  renderJobs () {
    this.renderCollection(
      this.model.jobs,
      this.rowView,
      this.queryByHook('jobs-list'),
      {
        reverse: true,
        emptyView: EmptyJobView
      }
    )
  }
})
