import App from 'init' // eslint-disable-line no-unused-vars

import $ from 'jquery'
import 'fullcalendar'
import 'fullcalendar/dist/fullcalendar.css'
import BaseView from 'view/base-view'

import CalendarView from 'components/calendar'
import bootbox from 'bootbox'

import './custom.css'

const SchedulerPageView = BaseView.extend({
  template: require('./page.hbs'),
  props: {
    schedules: 'array'
  },
  taskTemplate: require('./modal-body.hbs'),
  subviews: {
    calendar: {
      hook: 'calendar-container',
      waitFor: 'schedules',
      prepareView: function (el) {
        return new CalendarView({
          el: el,
          schedules: this.schedules,
          eventClickHandler: (scheduleEvent, mouseEvent, fullcalendar) => {
            let alertTitle = `Scheduled task: ${scheduleEvent.title}`
            let alertBody = this.taskTemplate({
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
  },
  initialize: function () {
    const self = this
    $.get('/api/schedule')
      .done(function (data) {
        self.schedules = data
      })
      .fail(function (xhr, err, xhrStatus) {
        bootbox.alert({
          message: xhr.responseText,
          title: 'Error getting schedules'
        })
      })
  }
})

// instantiate and render on element
const page = new SchedulerPageView({ // eslint-disable-line no-unused-vars
  el: document.getElementById('schedulePageContainer')
})
