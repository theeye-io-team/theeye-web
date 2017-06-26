/* global BaseView, Templates, _, humanInterval */

/**
 *
 * kind of modular structure
 * @author Facugon
 *
 */
var SchedulerPageView = (function(){

  function buildEventSeries (title, scheduleDate, interval, rangeStart, rangeEnd) {
    var events = [];
    interval = interval ? humanInterval(interval) : false;
    var start;
    if (scheduleDate < rangeStart) {
      // get offset from 0 hours of sunday (first day of week on fullcalendar)
      var offset =
        scheduleDate.getDay() * 24 * 60 * 60 * 1000
        + (scheduleDate.getHours() * 60 * 60 * 1000)
        + (scheduleDate.getMinutes() * 60 * 1000);
      start = rangeStart.valueOf() + offset;
    } else {
      start = scheduleDate.valueOf();
    }
    var end = rangeEnd.valueOf();
    if (interval) {
      for (var ii = start; ii <= end; ii += interval) {
        events.push({
          'title': title,
          start: new Date(ii)
        });
      }
    } else {
      // only if within range
      if (scheduleDate > rangeStart && scheduleDate < rangeEnd) {
        events.push({
          'title': title,
          start: new Date(scheduleDate)
        });
      }
    }
    return events;
  }

  function getEventSources (scheduleArray, name, rangeStart, rangeEnd) {
    return _.map(scheduleArray, function (schedule, index, arr) {
      // 200 is the offset of the color wheel where 0 is red, change at will.
      // 180 is how wide will the angle be to get colors from,
      // lower (narrower) angle will get you a more subtle palette.
      // Tone values are evenly sparsed based on array.length.
      // Check this: http://www.workwithcolor.com/hsl-color-picker-01.htm
      var wheelDegree = 200 + 180 / arr.length * ++index;
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
      };
    });
  }

  // use only one modal for the page.
  // var modal = new Modal({ title: 'Incoming Webhook' });
  // modal.render();

  var SchedulerPage = BaseView.extend({
    autoRender: true,
    template: Templates['assets/js/app/view/scheduler/page.hbs'],
    container: $('div[data-hook=scheduler-page-container]')[0],
    events: {},
    taskTemplate: Templates['assets/js/app/view/scheduler/task-modal-body.hbs'],
    onCalendarViewRender: function () {
      if (!this._rendered) return;
      this.$calendar.fullCalendar('removeEventSources');
      var view = this.$calendar.data('fullCalendar').getView();
      var events = getEventSources(this.collection, '', view.start, view.end);
      var self = this;
      events.forEach(function(item) {
        self.$calendar.fullCalendar('addEventSource', item);
      });
    },
    _rendered: false,
    collection: [],
    render:function(){
      BaseView.prototype.render.apply(this, arguments);
      var self = this;
      this.$calendar = $(this.el);

      this.$calendar.fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listWeek'
        },
        eventLimit: 5,
        viewRender: this.onCalendarViewRender.bind(this),
        defaultTimedEventDuration: '00:30:00',
        // eventClick: this.eventClickHandler || function () {},
        eventClick: function(scheduleEvent, mouseEvent, fullcalendar){
          let alertTitle = `Scheduled task: ${scheduleEvent.title}`;
          let alertBody = self.taskTemplate({
            taskText: scheduleEvent.start.calendar(),
            taskId: scheduleEvent.source.scheduleData.data.task_id
          });
          alert(alertBody, alertTitle, function(){});
        },
        aspectRatio: 1.618 // golden
      });

      // mock ampersand-view _rendered prop
      this._rendered = true;

      //TODO cambiar $.get por un polyfill/xhr
      $.get("/api/schedule")
        .done(function(data){
          self.collection = data;
          self.onCalendarViewRender();
        })
        .fail(function(xhr, err, xhrStatus) {
          alert(xhr.responseText);
        });

    }
  });

  // kind of page router/controller
  return function () {
    new SchedulerPage({ collection: [] });
  };

})();
