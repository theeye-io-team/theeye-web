import View from 'ampersand-view'
import JobExecButton from './job-exec-button'
import moment from 'moment'

import './styles.less'

export default View.extend({
  template: `
    <div class="job-container">
      <div class="panel-heading">
        <h4 class="panel-title">
          <div class="panel-title-content">
            <div class="panel-item name">
              <div class="title" data-hook="title"></div>
            </div>
            <div data-hook="job-status-container" class="panel-item icons">
            </div>
          </div>
        </h4>
      </div>
    </div>
  `,
  derived: {
    row_title: {
      deps: ['model.creation_date'],
      fn () {
        return moment(this.model.creation_date).format('DD-MM-YY HH:mm:ss')
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
