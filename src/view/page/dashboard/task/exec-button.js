import View from 'ampersand-view'

module.exports = View.extend({
  initialize () {
    View.prototype.initialize.apply(this, arguments)
  },
  bindings: {
    'model.inProgressJobs': [
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
