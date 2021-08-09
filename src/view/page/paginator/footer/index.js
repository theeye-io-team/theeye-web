import App from 'ampersand-app'
import View from 'ampersand-view'
import Collection from 'ampersand-collection'
import { LIMIT_COUNTER } from 'constants/paginator'
import './styles.less'

const JobsPaginator = View.extend({
  props: {
    listLength: ['number', false, LIMIT_COUNTER],
    jobsLength: ['number', false, 0],
    lastPage: 'boolean'
  },
  template: `
    <div data-component="paginator-footer">
    <div class="btn btn-primary fa fa-chevron-left" data-hook="back-btn"></div>
    <span class="jobs-count" data-hook="jobs-count"></span>
    <div class="btn btn-primary fa fa-chevron-right" data-hook="fwd-btn"></div>
      <select class="select right">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="500">500</option>
      </select>
    </div>
  `,
  bindings: {
    count: {
      hook: 'jobs-count'
    }
  },
  events: {
    'change select': 'onSelectChange',
    'click [data-hook=back-btn]': 'navigationChange',
    'click [data-hook=fwd-btn]': 'navigationChange'
  },
  onSelectChange (event) {
    const el = this.query('select')
    this.model.paginator_length = Number(el.value)
    this.model.paginator_last = this.model.paginator_first + this.model.paginator_length - 1
    // TODO: Make back and forward button invisible if user can't scroll
    // App.actions.localSettings.update('jobsListLength', Number(el.value))
  },
  navigationChange (event) {
    switch (event.target.attributes[1].nodeValue) {
      case 'fwd-btn':
        if (this.model.paginator_last != this.jobsLength - 1) {
          this.model.paginator_first = this.model.paginator_last + 1
          if (this.model.paginator_last + this.model.paginator_length > this.jobsLength - 1) {
            this.model.paginator_last = this.jobsLength - 1
            this.lastPage = true
          } else {
            this.model.paginator_last += this.model.paginator_length
            this.lastPage = false
          }
        }
        break;

      case 'back-btn':
        if (this.model.paginator_first != 0) {
          this.model.paginator_last = this.model.paginator_first - 1
          if (this.model.paginator_first - this.model.paginator_length < 0) 
            this.model.paginator_first = 0
          else
            this.model.paginator_first -= this.model.paginator_length
        }
        break

      default:
        break
    }
  },
  initialize () {
    this.listenToAndRun(this.model, 'change:paginator_length', () => {
      // this.listLength = App.state.localSettings.jobsListLength || LIMIT_COUNTER
      this.listLength = this.model.paginator_length
      this.model.paginator_last = this.model.paginator_first + this.model.paginator_length - 1
    })

    // update collection length
    this.listenToAndRun(this.model.jobs, 'add remove sync reset', () => {
      this.jobsLength = this.model.jobs.length

      if (this.lastPage) {
        if (this.model.paginator_first + this.model.paginator_length > this.jobsLength - 1) {
          this.model.paginator_last = this.jobsLength - 1
          this.lastPage = true
        }
        else {
          this.lastPage = false
        }
      }

      while (this.jobsLength < this.model.paginator_first) {
        this.model.paginator_last = this.model.paginator_first
        this.model.paginator_first = this.model.paginator_first - this.model.paginator_length
      }
    })
  },
  derived: {
    count: {
      deps: ['jobsLength', 'model.paginator_first', 'model.paginator_last'],
      fn () {
        if (this.jobsLength > this.model.paginator_length) {
          return `showing jobs ${this.model.paginator_first + 1} - ${this.model.paginator_last + 1} out of ${this.jobsLength}`
        } else {
          return this.jobsLength
        }
      }
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.el.querySelector('select').value = this.listLength
  }
})

const CollectionPaginator = View.extend({
  props: {
    length: 'number',
    page: 'number'
  },
  template: `
    <div data-component="paginator-footer">
    <div class="btn btn-primary dark fa fa-chevron-left" data-hook="back-btn"></div>
    <span class="list-count" data-hook="list-count"></span>
    <div class="btn btn-primary dark fa fa-chevron-right" data-hook="fwd-btn"></div>
      <select class="select dark right">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="500">500</option>
      </select>
    </div>
  `,
  // bindings: {
  //   count: {
  //     hook: 'list-count'
  //   }
  // },
  events: {
    'change select': 'onSelectChange',
    'click [data-hook=back-btn]': 'navigationChange',
    'click [data-hook=fwd-btn]': 'navigationChange'
  },
  onSelectChange (event) {
    const el = this.query('select')
    this.pageLength = Number(el.value)
    this.parent.updateList(true)
    // TODO: Make back and forward button invisible if user can't scroll
    // App.actions.localSettings.update('jobsListLength', Number(el.value))
  },
  navigationChange (event) {
    switch (event.target.attributes[1].nodeValue) {
      case 'fwd-btn':
        if (this.pageLength * (this.page + 1) < this.length) {
          this.page++
          this.queryByHook('list-count').innerHTML = this.changeCount()
          this.parent.updateList()
        }
        break

      case 'back-btn':
        if (this.page !== 0) {
          this.page--
          this.queryByHook('list-count').innerHTML = this.changeCount()
          this.parent.updateList()
        }
        break

      default:
        break
    }
  },
  initialize (opts) {
    this.pageLength = LIMIT_COUNTER
    console.log(this.length)
  },
  changeCount () {
    if (this.pageLength < this.length) {
      if ((this.page + 1) * this.pageLength > this.length) 
        return `showing jobs ${(this.page * this.pageLength) + 1} - ${this.length} out of ${this.length}`
      else
        return `showing jobs ${(this.page * this.pageLength) + 1} - ${(this.page + 1) * this.pageLength} out of ${this.length}`
    } else {
      return this.length
    }
  },
  render () {
    this.renderWithTemplate(this)

    this.el.querySelector('select').value = this.pageLength
    this.on('changeList', () => {
      this.queryByHook('list-count').innerHTML = this.changeCount()
    })
  }
})

export { JobsPaginator, CollectionPaginator }
