import TaskCollapsibleRow from './collapsible-row'
import TaskConstants from 'constants/task'
import ScheduleTaskButton from 'view/page/task/buttons/schedule'

module.exports = TaskCollapsibleRow.extend({
  derived: {
    hostname: {
      deps: ['model.hostname'],
      fn () {
        return `(${this.model.hostname})` || '(Hostname not assigned)'
      }
    },
    type: {
      fn: () => TaskConstants.TYPE_SCRAPER
    },
    type_icon: {
      fn: () => 'fa fa-code'
    },
    header_type_icon: {
      fn: () => 'circle fa fa-cloud scraper-color'
    }
  },
  renderButtons () {
    TaskCollapsibleRow.prototype.renderButtons.apply(this, arguments)

    this.renderSubview(
      new ScheduleTaskButton({ model: this.model }),
      this.query('ul.dropdown-menu[data-hook=buttons-container]')
    )
  }
})
