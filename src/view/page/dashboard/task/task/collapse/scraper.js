import TaskCollapsibleRow from './collapsible-row'
import TaskConstants from 'constants/task'
import JobRow from './job'

module.exports = TaskCollapsibleRow.extend({
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return `(${this.model.hostname})` || '(Hostname not assigned)'
      }
    },
    type: {
      fn: () => TaskConstants.TYPE_SCRAPER
    },
    type_icon: {
      fn: () => 'fa fa-code'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-cloud scraper-color'
    }
  },
  renderCollapsedContent () {
    const jobRows = this.renderCollection(
      this.model.jobs,
      JobRow,
      this.queryByHook('collapse-container-body'),
      {
        reverse: true
      }
    )
  }
})
