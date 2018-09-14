import TaskCollapsibleRow from './collapsible-row'
import TaskConstants from 'constants/task'
import JobRow from './job'
import EmptyJobView from '../../empty-job-view.js'

module.exports = TaskCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => TaskConstants.TYPE_DUMMY
    },
    type_icon: {
      fn: () => 'fa fa-list-ul'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-list-ul dummy-color'
    }
  },
  renderCollapsedContent () {
    const jobRows = this.renderCollection(
      this.model.jobs,
      JobRow,
      this.queryByHook('collapse-container-body'),
      {
        reverse: true,
        emptyView: EmptyJobView
      }
    )
  }
})
