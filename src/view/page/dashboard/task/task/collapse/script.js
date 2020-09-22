import TaskCollapsibleRow from './collapsible-row'
import * as TaskConstants from 'constants/task'
import ScheduleButton from 'view/buttons/schedule'

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
    }
  },
  renderButtons () {
    TaskCollapsibleRow.prototype.renderButtons.apply(this, arguments)

    this.renderSubview(
      new ScheduleButton({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )
  }
})
