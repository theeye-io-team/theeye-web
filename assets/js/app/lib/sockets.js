
var SocketsConnector = (function(options){
  var io = options.io;
  var log = debug('eye::sockets');

  this.events = [
    {
      name:'events-update',
      handler:function(message){
        log('new event');
        log(message);
      }
    },
  ];

  function loadEvents (events) {
    events.forEach(function(event){
      io.socket.on(event.name,event.handler);
    });
  }
  loadEvents(this.events);

  function subscribe(){
    io.socket.post(
      '/events/subscribe',
      {},
      function(data, jwres) {
        log('subscribed to event updates');
      }
    );
    io.socket.post(
      '/palanca/subscribe',
      {customer:Cookies.getJSON('theeye').customer},
      function(data, jwres){
        log('subscribed to trigger updates');
      }
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
