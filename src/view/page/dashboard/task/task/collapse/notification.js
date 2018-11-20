import TaskCollapsibleRow from './collapsible-row'
import TaskConstants from 'constants/task'

module.exports = TaskCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => TaskConstants.TYPE_NOTIFICATION
    },
    type_icon: {
      fn: () => 'fa fa-bell-o'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-bell-o notification-color'
    }
  }
})
