import 'fullcalendar'
import 'fullcalendar/dist/fullcalendar.css'
import BaseView from 'view/base-view'

import CalendarView from 'components/calendar'
import bootbox from 'bootbox'

import './custom.css'

export default BaseView.extend({
  template ()  {
    let html = `
      <div class="admin-panel">
        <h3 data-hook="list-title">Scheduler <span class="thaClock"></span></h3>
        <div class="" data-hook="calendar-container"></div>
      </div>
      `
    return html
  },
  subviews: {
    calendar: {
      hook: 'calendar-container',
      prepareView: function (el) {
        return new CalendarView({
          el: el,
          collection: this.collection,
          eventClickHandler: (scheduleEvent, mouseEvent, fullcalendar) => {
            let alertTitle = `Scheduled task: ${scheduleEvent.title}`
            let alertBody = modalTemplate({
              taskText: scheduleEvent.start.calendar(),
              taskId: scheduleEvent.source.scheduleData.data.task_id
            })

            bootbox.alert({
              message: alertBody,
              title: alertTitle
            })
          }
        })
      }
    }
  }
})

const modalTemplate = (opts) => {
  const {taskId, taskText} = opts
  let html = `
    <div class="row">
      <div class="col-sm-12">
        ${taskText}
        <a href="/admin/task#search=${taskId}" class="btn btn-primary pull-right">
          <span class="fa fa-edit"></span>
          Edit
        </a>
      </div>
    </div>
  `
  return html
}
