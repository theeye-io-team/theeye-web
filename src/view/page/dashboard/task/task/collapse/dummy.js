import TaskCollapsibleRow from './collapsible-row'
import * as TaskConstants from 'constants/task'
import { Images as IconsImages } from 'constants/icons'

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
      deps: ['model.icon_image'],
      fn () {
        return (this.model.icon_mage || IconsImages.dummy)
      }
    }
  }
})
