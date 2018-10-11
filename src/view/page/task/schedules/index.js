import { cancelSchedule } from 'actions/schedule'
import View from 'ampersand-view'
import bootbox from 'bootbox'
import './style.less'

export const Schedules = View.extend({
  template: `
    <div class="col-xs-12 schedules-list-component">
      <h4>Schedules for this task</h4>
      <div class="scheduleHeader">
        <div class="col-sm-4"><h5>Initial date:</h5></div>
        <div class="col-sm-2"><h5>Repeats every:</h5></div>
        <div class="col-sm-4"><h5>Next iteration:</h5></div>
        <div class="col-sm-2"></div>
      </div>
      <div data-hook="schedule-list"></div>
    </div>
  `,
  bindings: {
    'model.hasSchedules': {
      type: 'toggle',
      selector: ''
    }
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCollection(
      this.model.schedules,
      ScheduleRow,
      this.queryByHook('schedule-list'),
      {
        viewOptions: {
          task: this.model
        }
      }
    )
  }
})

export default Schedules

const ScheduleRow = View.extend({
  props: {
    task: ['state', true]
  },
  template: `
    <div class="scheduleItem row">
      <div class="col-sm-4"><p data-hook="startDate"></p></div>
      <div class="col-sm-2"><p data-hook="repeatsEvery"></p></div>
      <div class="col-sm-4"><p data-hook="nextDate"></p></div>
      <div class="col-sm-2 text-right">
        <button type="button" class="btn btn-danger btn-sm deleteSchedule">
          Delete <span class="fa fa-trash"></span>
        </button>
      </div>
    </div>`,
  events: {
    'click button.deleteSchedule': 'deleteSchedule'
  },
  deleteSchedule: function (event) {
    bootbox.confirm(
      'The schedule will be canceled. Want to continue?',
      confirmed => {
        if (!confirmed) {
          return
        }
        cancelSchedule(this.task.id, this.model._id)
      }
    )
  },
  bindings: {
    'model.data.scheduleData.runDate': {
      hook: 'startDate',
      type: function(el, value, previousValue) {
        el.innerHTML = new Date(value).toString()
      }
    },
    'model.data.scheduleData.repeatEvery': {
      hook: 'repeatsEvery'
    },
    'model.nextRunAt': {
      hook: 'nextDate',
      type: function(el, value, previousValue) {
        el.innerHTML = new Date(value).toString()
      }
    }
  }
})
