/**
 *
 * Simple socket connector.
 * how to use
 *
 *  // connect sockets and start listening to events
 *  SocketsWrapper({
 *    io: window.io,
 *    channel:'/socket/subscribe',
 *    query: {
 *      param: 'a custom param', 
 *    },
 *    onSubscribed:function(data,jwres){
 *      log('subscribed to event updates');
 *    },
 *    events: {
 *      'event-name': function eventHandler(data) {
 *      },
 *      'another-event': function ... (data) {
 *      }
 *    }
 *  });
 *
 */

import Events from 'ampersand-events'
import assign from 'lodash/assign'
const log = require('debug')('eye::sockets')

function SocketsWrapper (options) {

  // only instances can extended its own prototype
  if ( ! (this instanceof SocketsWrapper) ) {
    return new SocketsWrapper(options)
  }

  assign(this, Events)

  const io = options.io
  const self = this

  for (let event in options.events) {
    io.socket.on(event, function(message){
      options.events[event](message);
    });
  }

  function subscribe (socket) {
    var emit = socket.emit;
    socket.emit = function() {
      log('socket emit', Array.prototype.slice.call(arguments));
      emit.apply(socket, arguments);
    };

    var $emit = socket.$emit;
    socket.$emit = function() {
      log('socket event',Array.prototype.slice.call(arguments));
      $emit.apply(socket, arguments);
      self.trigger(arguments[0],arguments[1]);
    };

    socket.post(
      options.channel,
      options.query,
      options.onSubscribed
    );
  }

  if (io.socket.socket && io.socket.socket.connected) {
    log('socket already connected, subscribing...');
    subscribe(io.socket);
  } else {
    log('connecting socket server');
    io.socket.on('connect',function(){
      log('socket connected! subscribing...');
      subscribe(io.socket);
    });
  }

  return this
}

module.exports = SocketsWrapper
