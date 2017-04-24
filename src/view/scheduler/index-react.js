import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from './Calendar';


import humanInterval from '../human-interval';
import map from 'lodash/map';

let scheduleData = [];

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
  return map(scheduleData, function(scheduleEvent, index, arr){
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

//TODO cambiar $.get por un polyfill/xhr
$.get("/api/schedule")
  .done(function(data){
    scheduleData = getEventSources(data);

    ReactDOM.render(<Calendar events={scheduleData} />, document.getElementById('schedulePageContainer'));

  })
  .fail(function(xhr, err, xhrStatus) {
    alert(xhr.responseText);
  });
