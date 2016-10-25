/* global BaseView, Modal, Templates, _, humanInterval */

/**
 *
 * kind of modular structure
 * @author Facugon
 *
 */
var SchedulerPageView = (function(){

  function buildEventSeries(title, startingDate, interval) {
    var events = [];
    var halfHourInMiliseconds = 30 * 60 * 1000;
    interval = interval ? humanInterval(interval) : false;
    //60 iterations / dates
    if(interval) {
      for(var ii = 0; ii < 60; ii++) {
        events.push({
          title: title,
          start: new Date(startingDate + (interval * ii)),
          end: new Date(startingDate + (interval * ii) + halfHourInMiliseconds)
        });
      }
    }else{
      events.push({
        title: title,
        start: new Date(startingDate),
        end: new Date(startingDate + halfHourInMiliseconds)
      });
    }
    return events;
  }

  function getEventSources(scheduleData, name) {
    return _.map(scheduleData, function(scheduleEvent, index, arr){
      var ms = new Date(scheduleEvent.data.scheduleData.runDate);
      // 170 is the offset of the color wheel where 0 is red, change at will.
      // 180 is how wide will the angle be to get colors from,
      // lower (narrower) angle will get you a more subtle palette.
      // Tone values are evenly sparsed based on array.length, within the given angle (180)
      // Check this: http://www.workwithcolor.com/hsl-color-picker-01.htm
      var wheelDegree = 170 + 180 / arr.length * ++index;
      return {
        id: scheduleEvent._id,
        backgroundColor: 'hsl('+wheelDegree+', 80%, 65%)',
        textColor: 'white',
        className: ["calendarEvent"],
        scheduleData: scheduleEvent,
        events: buildEventSeries(
          scheduleEvent.data.name,
          ms.valueOf(),
          scheduleEvent.data.scheduleData.repeatEvery
        )
      };
    });

  }

  // use only one modal for the page.
  var modal = new Modal({ title: 'Incoming Webhook' });
  modal.render();

  var SchedulerPage = BaseView.extend({
    autoRender: true,
    template: Templates['assets/js/app/view/scheduler/page.hbs'],
    container: $('div[data-hook=scheduler-page-container]')[0],
    events: {},
    render:function(){
      BaseView.prototype.render.apply(this, arguments);
      var scheduleData = [];
      var self = this;
      //TODO cambiar $.get por un polyfill/xhr
      $.get("/api/schedule")
        .done(function(data){
          scheduleData = getEventSources(data);
          var calendar = self.queryByHook('schedule-container').fullCalendar({
            header: {
              left: 'prev,next today',
              center: 'title',
              right: 'month,agendaWeek,agendaDay,listWeek'
            },
            defaultTimedEventDuration: '00:30:00',
            aspectRatio: 1.618 //golden
          });
          scheduleData.forEach(function(item){
            calendar.fullCalendar('addEventSource', item);
          });

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
