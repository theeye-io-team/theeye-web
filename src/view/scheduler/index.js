import 'fullcalendar'
import 'fullcalendar/dist/fullcalendar.css'
import BaseView from 'view/base-view'

import CalendarView from 'components/calendar'
import bootbox from 'bootbox'

//import React from 'react'
//import ReactDOM from 'react-dom'
//import SimpleClock from 'components/simple-clock.jsx'

import './custom.css'

module.exports = BaseView.extend({
  template: require('./page.hbs'),
  taskTemplate: require('./modal-body.hbs'),
  subviews: {
    calendar: {
      hook: 'calendar-container',
      prepareView: function (el) {
        return new CalendarView({
          el: el,
          collection: this.collection,
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
//  render: function () {
//    this.renderWithTemplate(this)
//    ReactDOM.render(<SimpleClock />, this.el.querySelector('.thaClock'))
//  }
})
