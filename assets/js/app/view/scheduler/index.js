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

  // var WebhookView = BaseView.extend({
  //   template: Templates['assets/templates/webhook/list-item.hbs'],
  //   events: {
  //     "click [data-hook=edit]":"onClickEdit",
  //     "click [data-hook=remove]":"onClickRemove",
  //     "click [data-hook=trigger]":"onClickTrigger"
  //   },
  //   onClickEdit:function(event){
  //     event.preventDefault();
  //     event.stopPropagation();
  //     this.edit();
  //   },
  //   onClickRemove:function(event){
  //     event.preventDefault();
  //     event.stopPropagation();
  //     WebhookActions.remove(this.model);
  //   },
  //   onClickTrigger:function(event){
  //     event.preventDefault();
  //     event.stopPropagation();
  //     WebhookActions.trigger(this.model);
  //   },
  //   initialize:function(){
  //     BaseView.prototype.initialize.apply(this, arguments);
  //     var form = new WebhookFormView({ model: this.model });
  //     this.form = form;
  //
  //     // re render item on change
  //     this.model.on('change',function(){
  //       this.render();
  //     },this);
  //
  //     this.model.on('destroy',function(){
  //       this.remove();
  //     },this);
  //   },
  //   edit:function(){
  //     var form = this.form,
  //       model = this.model;
  //
  //     form.container = modal.queryByHook('container')[0];
  //     modal.$el.on('show.bs.modal',function(){
  //       form.render();
  //     });
  //     modal.$el.on('shown.bs.modal', function(){
  //       form.focus();
  //     });
  //     // once hide modal remove scraper form
  //     modal.$el.on('hidden.bs.modal', function(){
  //       form.remove();
  //       modal.$el.off('click','button[data-hook=save]');
  //     });
  //     modal.$el.on('click','button[data-hook=save]',function(){
  //       model.set(form.data);
  //       WebhookActions.update(model);
  //     });
  //
  //     modal.show();
  //   },
  //   remove:function(){
  //     BaseView.prototype.remove.apply(this, arguments);
  //     this.form.remove();
  //   }
  // });

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
