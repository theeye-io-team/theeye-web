import TaskCollapsibleRow from './collapsible-row'
import * as TaskConstants from 'constants/task'
import ScheduleButton from 'view/buttons/schedule'
import acls from 'lib/acls'

export default TaskCollapsibleRow.extend({
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return `(${this.model.hostname})` || '(Hostname not assigned)'
      }
    },
    type: {
      fn: () => TaskConstants.TYPE_SCRIPT
    },
    type_icon: {
      fn: () => 'fa fa-code'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-code script-color'
    },
    image: {
      deps: ['model.image'],
      fn () {
        if (this.model.image) return this.model.image
        else return '/images/script.png'
      }
    }
  },
  renderButtons () {
    TaskCollapsibleRow.prototype.renderButtons.apply(this, arguments)

    if (acls.hasAccessLevel('admin')) {
      this.renderSubview(
        new ScheduleButton({ model: this.model }),
        this.query('ul.dropdown-menu[data-hook=buttons-container]')
      )
    }
  }
})
