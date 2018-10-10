import View from 'ampersand-view'
import DeleteJobsButton from 'view/page/dashboard/task/delete-jobs-button'
import EmptyJobView from '../empty-job-view'
import Acls from 'lib/acls'
import './styles.less'

module.exports = View.extend({
  template: `
  <div class="col-xs-12 jobs-list-component">
    <div class="title-container">
      <h3>
        <span data-hook="collapse-title"></span>
        <div class="buttons-container">
          <span class="delete-jobs-button" data-hook="delete-jobs-button"> </span>
        </div>
      </h3>
    </div>
    <div data-hook="jobs-list"></div>
  </div>
  `,
  props: {
    collapse_title: ['string', false, 'Execution history'],
    rowView: 'function'
  },
  bindings: {
    collapse_title: [
      {
        type: 'text',
        hook: 'collapse-title'
      },
      {
        type: 'toggle',
        hook: 'collapse-title'
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
