import humanInterval from 'lib/human-interval'
import map from 'lodash/map'
import $ from 'jquery'
import 'fullcalendar'
import 'fullcalendar/dist/fullcalendar.css'
import View from 'ampersand-view'

module.exports = View.extend({
  autoRender: true,
  template: '<div data-hook="calendar-container"></div>',
  props: {
    eventClickHandler: 'any'
  },
  initialize: function () {
    this.listenTo(this.collection, 'change sync', this.onCalendarViewRender)
  },
  onCalendarViewRender: function () {
    if (!this._rendered) return
    this.$calendar.fullCalendar('removeEventSources')
    var view = this.$calendar.data('fullCalendar').getView()
    const events = getEventSources(this.collection.toJSON(), '', view.start, view.end)
    events.forEach(item => {
      this.$calendar.fullCalendar('addEventSource', item)
    })
  },
  noop: function () {},
  render: function () {
    this.renderWithTemplate()
    this.$calendar = $(this.el)

    this.$calendar.fullCalendar({
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listWeek'
      },
      eventLimit: 5,
      viewRender: this.onCalendarViewRender.bind(this),
      defaultTimedEventDuration: '00:30:00',
      eventClick: this.eventClickHandler || this.noop,
      // eventClick: function(scheduleEvent, mouseEvent, fullcalendar){
      //   console.log(scheduleEvent);
      //   let alertTitle = `Scheduled task: ${scheduleEvent.title}`;
      //   let alertBody = self.taskTemplate({
      //     taskText: scheduleEvent.start.calendar(),
      //     taskId: scheduleEvent.source.scheduleData.data.task_id
      //   });
      //   alert(alertBody, alertTitle, function(){});
      // },
      aspectRatio: 1.618 // golden
    })
  }
})

function buildEventSeries (title, scheduleDate, interval, rangeStart, rangeEnd) {
  var events = []
  interval = interval ? humanInterval(interval) : false
  var start = scheduleDate < rangeStart
    ? rangeStart.valueOf()
    : scheduleDate.valueOf()
  var end = rangeEnd.valueOf()
  if (interval) {
    for (var ii = start; ii <= end; ii += interval) {
      events.push({
        'title': title,
        start: new Date(ii)
      })
    }
  } else {
    // only if within range
    if (scheduleDate > rangeStart && scheduleDate < rangeEnd) {
      events.push({
        'title': title,
        start: new Date(scheduleDate)
      })
    }
  }
  return events
}

function getEventSources (scheduleArray, name, rangeStart, rangeEnd) {
  return map(scheduleArray, function (schedule, index, arr) {
    // 200 is the offset of the color wheel where 0 is red, change at will.
    // 180 is how wide will the angle be to get colors from,
    // lower (narrower) angle will get you a more subtle palette.
    // Tone values are evenly sparsed based on array.length.
    // Check this: http://www.workwithcolor.com/hsl-color-picker-01.htm
    var wheelDegree = 200 + 180 / arr.length * ++index
    return {
      id: schedule._id,
      backgroundColor: 'hsl(' + wheelDegree + ', 80%, 48%)',
      textColor: 'white',
      className: ['calendarEvent'],
      scheduleData: schedule,
      events: buildEventSeries(
        schedule.data.name,
        // some magic is fuzzing with the returned date from api
        new Date(schedule.data.scheduleData.runDate),
        schedule.data.scheduleData.repeatEvery,
        rangeStart,
        rangeEnd
      )
    }
  })
}
