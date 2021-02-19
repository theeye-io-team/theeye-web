import App from 'ampersand-app'
import View from 'ampersand-view'
import bootbox from 'bootbox'
import moment from 'moment'
import './style.less'

export const Schedules = View.extend({
  template: `
    <div data-component="schedules-list">
      <h4>Schedules list</h4>
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
          scheduledModel: this.model
        }
      }
    )
  }
})

export default Schedules

const ScheduleRow = View.extend({
  props: {
    scheduledModel: ['state', true]
  },
  template: `
    <div class="scheduleItem row">
      <div class="col-xs-12">
        <h4>
          <div class="scheduleData">
            <span class="scheduleTitle">Repeats every: </span>
            <span data-hook="repeatsEvery"></span>
            <span class="breakline" style="display:none;"><br></span>
            <span class="scheduleTitle">Next iteration: </span>
            <span data-hook="nextDate"></span>
            <a href="#" data-hook="delete" class="btn-primary btn delete-schedule">
              <span class="fa fa-trash"></span>
            </a>
          </div>
        </h4>
      </div>
    </div>`,
  events: {
    'click [data-hook=delete]': 'onClickDelete'
  },
  onClickDelete: function (event) {
    bootbox.confirm({
      buttons: {
        confirm: {
          label: 'Delete schedule',
          className: 'btn-danger'
        }
      },
      message: 'The schedule will be deleted. Want to continue?',
      backdrop: true,
      callback: (confirmed) => {
        if (confirmed) {
          App.actions.scheduler.cancel(this.scheduledModel, this.model)
        }
      }
    })
  },
  bindings: {
    'model.data.scheduleData.repeatEvery': {
      hook: 'repeatsEvery',
      type: function (el, value, previousValue) {
        if (!value) {
          el.innerHTML = 'Runs once'
        } else {
          el.innerHTML = value
        }
      }
    },
    'model.nextRunAt': {
      hook: 'nextDate',
      type: function (el, value, previousValue) {
        el.innerHTML = moment(value).format('dddd, MMMM Do YYYY, h:mm:ss a')
      }
    }
  }
})
