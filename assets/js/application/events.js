/* global debug, $searchbox */
// Simple log function to keep the example simple
var $state = $({});
var deb = debug('eye:web:events');

function log() {
  deb.apply(deb, arguments);
}

(function(io) {
  var socket = io.socket;
  function onSocketIoConnect(){
    socket.on('events-update', function onServerSentResourceEvent(resource)
    {
      log('resource event update received');
      log(resource);

      if( resource.event == "host_registered" ){
        return document.location.reload();
      }

      if( !resource.type || resource.type!='agent' ) {
        var $resource = $('div.resource-container#resource-' + resource.id);
        if( typeof $resource[0] != 'undefined' ) {
          var $icon = $resource.find('div#state-' + resource.id + ' span.status');

          log('switching state icon');
          switchStateIcon(resource.state, $icon[0]);
          updateStateTag(resource.state, $resource);
        }

        $state.trigger('new_event', resource);
      }

    });
    socket.post('/events/subscribe', {}, function resourceSocketSubscription(data, jwres) {
      log('subscribed to events updates');
    });
  }

  if( socket.socket && socket.socket.connected ) {
    onSocketIoConnect();
  }
  log('listening sockets connect');
  socket.on("connect",onSocketIoConnect);

})( window.io );

function updateStateTag (state, $resource) {
  var tags = $resource.data('tags').split(',');

  for(var i=0; i<tags.length; i++){
    var tag = tags[i];
    var newState = 'state=' + state;
    if( /state=/.test(tag) === true ){
      tags[i] = newState ;
    }
  }

  $resource.data('tags', tags.join(','));
}

function switchStateIcon (state, elSpan) {

  elSpan.className = 'status';
  elSpan.title = state;

  switch(state) {
    case 'normal':
      elSpan.className += ' glyphicon glyphicon-ok-sign';
      break;
    case 'failure':
      elSpan.className += ' glyphicon glyphicon-exclamation-sign';
      break;
    case 'updates_stopped':
      elSpan.className += ' glyphicon glyphicon-remove-sign';
      break;
    default:
      log('invalid state reported by resource');
      break;
  }
}

var $upNrunning = $(".resources-panel .allUpNrunning");
var $resourcesList = $(".resources-panel .resources-panel-list");

$searchbox.on('search:start', function() {
  log('searching');
  $upNrunning.slideUp();
  $resourcesList.slideDown();
});

$searchbox.on('search:empty', function() {
  log('stop searching');
  checkAllUpAndRuning();
});

$state.on('new_event', function(event, resource) {
  if( ! $searchbox.searching ) checkAllUpAndRuning() ;
});

function checkAllUpAndRuning()
{
  var sadStates =
    $('div.state-resource-container .state-icon.icon-warn').length +
    $('div.state-resource-container .state-icon.icon-error').length;

  var showResources = sadStates > 0;

  if(showResources) {
    $upNrunning.slideUp();
    $resourcesList.slideDown();
  } else {
    $upNrunning.slideDown();
    $resourcesList.slideUp();
  }
}

$(function(){

  $('.editMonitors').on('click', function(evt){
    evt.preventDefault();
    evt.stopPropagation();
    var hostName = $(this).closest('.itemRow').data('item-name');
    window.location = "/admin/monitor#search="+hostName;
  });
  $('.monitorStats').on('click', function(evt){
    evt.preventDefault();
    evt.stopPropagation();
    var hostId = $(this).closest('.itemRow').data('item-id');
    window.location = "/hoststats/"+hostId;
  });

  checkAllUpAndRuning();
});
