import App from 'ampersand-app'
import View from 'ampersand-view'
import { LIMIT_COUNTER } from 'constants/paginator'
import './styles.less'

export default View.extend({
  props: {
    listLength: ['number', false, LIMIT_COUNTER],
    jobsLength: ['number', false, 0],
  },
  template: `
    <div data-component="paginator-footer">
      <span data-hook="jobs-count"></span>
      <select class="select right">
        <option value="10">10</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="500">500</option>
      </select>
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
