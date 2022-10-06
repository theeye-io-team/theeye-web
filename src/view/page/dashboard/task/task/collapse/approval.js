import TaskCollapsibleRow from './collapsible-row'
import * as TaskConstants from 'constants/task'

export default TaskCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => TaskConstants.TYPE_APPROVAL
    },
    type_icon: {
      fn: () => 'fa fa-thumbs-o-up'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-thumbs-o-up approval-color'
    },
    image: {
      deps: ['model.icon_image'],
      fn () {
        return (this.model.icon_image || '/images/approval.png')
      }
    }
  }
})
