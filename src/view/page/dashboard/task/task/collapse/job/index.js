import View from 'ampersand-view'
import JobExecButton from './job-exec-button'
import moment from 'moment'

export default View.extend({
  template: `
    <div class="job-container">
      <div class="panel-heading">
        <h4 class="panel-title">
          <div class="panel-title-content">
            <span class="panel-item name">
              <span class="title" data-hook="title"></span>
            </span>
            <div data-hook="job-status-container" class="panel-item icons">
            </div>
          </div>
        </h4>
      </div>
    </div>
  `,
  derived: {
    row_title: {
      deps: ['model.user', 'model.creation_date'],
      fn () {
        let title = ''
        let date = moment(this.model.creation_date).format('D-MMM-YY, HH:mm:ss')
        if (this.model.user.username) {
          title += this.model.user.username
        }

        return title + ` ran on ${date}`
      }
    }
  },
  bindings: {
    row_title: { type: 'text', hook: 'title' }
  },
  render () {
    this.renderWithTemplate(this)
    this.renderButtons()
  },
  renderButtons () {
    this.renderSubview(
      new JobExecButton({ model: this.model }),
      this.queryByHook('job-status-container')
    )
  }
})
