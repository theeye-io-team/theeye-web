
var SocketsConnector = (function(options){
  var io = options.io;
  var log = debug('eye::sockets');

  options.events.forEach(function(event){
    io.socket.on(event.name,event.handler);
  });

  function subscribe () {
    io.socket.post(
      options.channel,
      options.query,
      options.onSubscribed
    );
  }
  if (io.socket.socket && io.socket.socket.connected) {
    log('socket already connected, subscribing...');
    subscribe();
  } else {
    io.socket.on("connect",function(){
      log('socket connected! subcribing...');
      subscribe();
    });
  }
});
