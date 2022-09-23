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
      deps: ['model.image'],
      fn () {
        if (this.model.image) return this.model.image
        else return '/images/approval.png'
      }
    }
  }
})
