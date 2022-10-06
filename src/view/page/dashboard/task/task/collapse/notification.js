import TaskCollapsibleRow from './collapsible-row'
import * as TaskConstants from 'constants/task'

export default TaskCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => TaskConstants.TYPE_NOTIFICATION
    },
    type_icon: {
      fn: () => 'fa fa-bell-o'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-bell-o notification-color'
    },
    image: {
      deps: ['model.icon_image'],
      fn () {
        return (this.model.icon_image || '/images/notification.png')
      }
    }
  }
})
