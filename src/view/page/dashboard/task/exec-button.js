import View from 'ampersand-view'

module.exports = View.extend({
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(
      this.model.jobs,
      'add change sync reset remove',
      this.udpateInProgressJobs
    )
  },
  props: {
    in_progress_jobs: ['number', true, 0]
  },
  bindings: {
    in_progress_jobs: [
      {
        type: 'text',
        hook: 'badge'
      },
      {
        type: 'toggle',
        hook: 'badge'
      }
    ]
  },
  udpateInProgressJobs () {
    let inProgressJobs = this.model.jobs.filter(job => job.inProgress)
    this.in_progress_jobs = inProgressJobs.length
  },
  template: `
    <li class="task-exec-button">
      <button class="btn btn-primary" data-hook="action_button">
        <i class="fa fa-play" aria-hidden="true"></i>
        <span class="badge" data-hook="badge">0</span>
      </button>
    </li>
  `,
  events: {
    'click button[data-hook=action_button]': 'onClick'
  }
})
