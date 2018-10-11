import TaskCollapsibleRow from './collapsible-row'
import TaskConstants from 'constants/task'

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
  }
})
