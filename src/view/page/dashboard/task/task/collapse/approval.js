import TaskCollapsibleRow from './collapsible-row'
import TaskConstants from 'constants/task'
import JobRow from './job'

module.exports = TaskCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => TaskConstants.TYPE_APPROVAL
    },
    type_icon: {
      fn: () => 'fa fa-thumbs-o-up'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-thumbs-o-up approval-color'
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
