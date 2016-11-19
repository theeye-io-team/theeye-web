
function SocketsConnector (options) {
  if ( ! this instanceof SocketsConnector ) {
    return new SocketsConnector(options);
  }

  _.extend(this, Backbone.Events);

  var self = this;
  var io = options.io;
  var log = debug('eye::sockets');

  for (var event in options.events) {
    io.socket.on(event,function(message){
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
    io.socket.on("connect",function(){
      log('socket connected! subcribing...');
      subscribe(io.socket);
    });
  }

  return this;
}
