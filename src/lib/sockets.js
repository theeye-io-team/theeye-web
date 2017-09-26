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
  const socket = io.socket
  const self = this

  function subscribe () {
    log('subscribing')

    socket.post(
      options.channel,
      options.query,
      options.onSubscribed
    )
  }

  for (let event in options.events) {
    socket.on(event, function(message){
      options.events[event](message);
    });
  }

  var emit = socket.emit
  socket.emit = function() {
    log('socket emit', Array.prototype.slice.call(arguments))
    emit.apply(socket, arguments)
  }

  var $emit = socket.$emit
  socket.$emit = function() {
    log('socket event',Array.prototype.slice.call(arguments))
    $emit.apply(socket, arguments)
    self.trigger(arguments[0],arguments[1])
  }

  socket.on('connect',function(){
    log('socket connected')
    subscribe()
  })

  socket.on('disconnect',function(){
    log('socket was disconnected')
  })

  if (socket.socket && socket.socket.connected) {
    subscribe()
  }

  return this
}

module.exports = SocketsWrapper
