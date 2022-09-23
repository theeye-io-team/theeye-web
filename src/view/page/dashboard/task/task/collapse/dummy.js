import TaskCollapsibleRow from './collapsible-row'
import * as TaskConstants from 'constants/task'

export default TaskCollapsibleRow.extend({
  derived: {
    type: {
      fn: () => 'input'
    },
    type_icon: {
      fn: () => 'fa fa-list-ul'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-list-ul dummy-color'
    },
    image: {
      deps: ['model.image'],
      fn () {
        if (this.model.image) return this.model.image
        else return '/images/dummy.png'
      }
    }
  }
})
