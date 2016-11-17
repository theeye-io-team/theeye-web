/* global getHashParams, debug, $searchbox, log, Ladda, bootbox, Cookies, Clipboard, _ */

// these went global, used on view and some functions, go replacing
var statesDicc = {
  normal: 0,
  failure: 1,
  updates_stopped: 2,
  unknown: 3
};
var iconsDicc = {
  normal: "icon-check",
  failure: "icon-warn",
  updates_stopped: "icon-error",
  unknown: "icon-nonsense"
};
var classToState = {
  "icon-check": "normal",
  "icon-warn": "failure",
  "icon-error": "updates_stopped",
  "icon-nonsense": "unknown"
};


function ResourcesFolding () {
  var $items = $('[data-hook=hidden-resources]');
  var $button = $('[data-hook=toggle-hidden-resources]');
  var $icon = $button.find('span');

  function toggle () {
    $items.slideToggle();
    $icon.toggleClass('glyphicon-menu-down glyphicon-menu-up');
  }

  $button.on('click',toggle);
  this.toggle = toggle;

  this.fold = function(){
    $items.slideUp();
    if ($icon.hasClass('glyphicon-menu-up')) {
      $icon
        .removeClass('glyphicon-menu-up')
        .addClass('glyphicon-menu-down');
    }
  };

  this.unfold = function(){
    $items.slideDown();
    if ($icon.hasClass('glyphicon-menu-down')) {
      $icon
        .removeClass('glyphicon-menu-down')
        .addClass('glyphicon-menu-up');
    }
  };

  this.hideButton = function(){
    $button.hide();
  }

  this.showButton = function(){
    $button.show();
  }
}

var resourcesFolding = new ResourcesFolding();

var $upNrunning = $(".resources-panel .allUpNrunning");
var $resourcesList = $(".resources-panel .resources-panel-list");

$searchbox.on('search:start',function(){
  log('searching');
  $upNrunning.slideUp();
  $resourcesList.slideDown();
  resourcesFolding.unfold();
});

$searchbox.on('search:empty',function(){
  log('stop searching');
  checkAllUpAndRuning();
  resourcesFolding.fold();
});

function checkAllUpAndRuning () {
  var sadStates = $('.state-icon.icon-warn').length + $('.state-icon.icon-error').length;
  var showResources = sadStates > 0;
  if(showResources) {
    // sort! only if any has some failure/warning
    $('.itemRow').sort(function(a,b){
      //get state icon element
      var stateIconA = $('.state-icon', a).first()[0];
      //get element classes that matches 'icon-*'
      var iconClassA = stateIconA.classList.value.split(" ").find(function(cls){
        return cls.indexOf('icon-') === 0;
      });
      //get state from class
      var stateValueA = classToState[iconClassA];

      var stateIconB = $('.state-icon', b).first()[0];
      var iconClassB = stateIconB.classList.value.split(" ").find(function(cls){
        return cls.indexOf('icon-') === 0;
      });
      var stateValueB = classToState[iconClassB];

      return statesDicc[stateValueA] < statesDicc[stateValueB];
    }).prependTo('#accordion');

    $upNrunning.slideUp();
    $resourcesList.slideDown();

    $('.itemRow').each(function(){
      var $row = $(this);
      var stateIcon = $row.find('.panel-heading .state-icon')[0];
      if ( !/warn|error/.test(stateIcon.className) ) {
        $row.appendTo( $('[data-hook=hidden-resources-container]') );
      }
    });

    resourcesFolding.showButton();
  } else {
    $upNrunning.slideDown();
    $resourcesList.slideUp();
    $('.itemRow').appendTo('.resources-panel-list #accordion');

    resourcesFolding.hideButton();
  }
}

$(function(){
  //
  // tasks hide
  //
  $('.task-item-row').each(function(){
    var $row = $(this);
    if ($row.data('badspecs')) {
      $row.appendTo( $('[data-hook=hidden-tasks-container]') );
    }
  });
  $('[data-hook=toggle-hidden-tasks]').on('click',function(event){
    $('[data-hook=hidden-tasks]').slideToggle();
    var $toggle = $(this).find('span');
    $toggle.toggleClass('glyphicon-menu-down glyphicon-menu-up');
  })
});

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
    var hostId = $(this).closest('.itemRow').data('item-host-id');
    window.location = "/hoststats/"+hostId;
  });
  $('a[data-hook=workflow-button]').on('click',function(event){
    event.preventDefault();
    event.stopPropagation();
    window.open(event.currentTarget.href, '_blank');
  });
  checkAllUpAndRuning();
});

function triggers (io){
  var log = debug('eye:web:triggers');

  /////////////////////////////////////////////
  // bulkRunner initialization
  /////////////////////////////////////////////

  // listen search:start and show bulkRunner button
  // unless there are no visible tasks in the div.tasks-panel
  $searchbox.on('search:start', function(evt){
    log('search:start');
    if(!$('.tasks-panel .js-searchable-item:visible').length) {
      $('.bulkRunner').hide();
      return;
    }
    $('.bulkRunner').show();
  });

  // listen search:done and show bulkRunner button
  // except: runner is running || no visible tasks in div.tasks-panel
  $searchbox.on('search:done', function(evt){
    log('search:done');
    if(!$('.tasks-panel .js-searchable-item:visible').length && !$('.bulkRunner').data('laddaIsRunning')) {
      $('.bulkRunner').hide();
      return;
    }
    $('.bulkRunner').show();
  });

  // listen search:empty and HIDE bulkRunner button
  // unless it IS running
  $searchbox.on('search:empty', function(evt){
    if($('.bulkRunner').data('laddaIsRunning')) return;
    $('.bulkRunner').hide();
  });


  /**
   * @chris mira como cambio tu lastRunToCollapsible duplicado villero jeje
   *
   * belleza
   *
   * biutiful!
   */
  var JobResultView = function (options) {

    var container = options.container;
    var data = options.data;

    var $tpl ;

    if( data._type == 'ScraperJob' ){
      var t = document.querySelector('div[data-hook=scraper-job-result-template]');
      $tpl = $( t.innerHTML ); // create an element with the block content
      $tpl.find('div[data-hook=json-container]').jsonViewer( data.result );
    }

    if( data._type == 'ScriptJob' ){
      $tpl = $('div.resultTemplate div').first().clone().remove();
      var script_result = (data.result.script_result||data.result); // temporal fix
      $tpl.find('.scriptStdout').html(script_result.stdout);
      $tpl.find('.scriptStderr').html(script_result.stderr);
      // $tpl.addClass('col-md-12');
    }

    var $container = $( container );
    var $title = $container.find('.panel-title-content').first();
    $title.addClass('task-done');

    $tpl.one('close.bs.alert', function(){
      $title.removeClass('task-done');

      options.onClose && options.onClose();
    });

    $container.find('.panel-body [data-hook="job-result-container"]').append($tpl);
  };



  // new task runner click handler
  $('.trigger-task').on('click', function(evt){
    evt.preventDefault();
    evt.stopPropagation();

    var elem = this;
    var $taskTitleContent = $(elem).closest('h4.panel-title').first();
    var $taskName = $taskTitleContent.find('span.panel-item.name');
    var $taskDiv = $(elem).closest('.tasks-panel .js-searchable-item').first();

    bootbox.confirm('Trigger task?',function(confirmed){
      if( !confirmed ) return;

      // for a task to be runnable the .js-searchable-item:visible
      // has to have a .data().taskId and a .trigger-task button
      var taskData = $taskDiv.data();
      // var triggerButtons = $(e).find('.trigger-task');
      if(!taskData.taskid) {
        return;
      }
      //ladda button init
      var btn = Ladda.create(elem);
      btn.start();

      // handles palancas-update io.socket event
      var handleTaskResult = function(data) {
        log(data);
        if(data.task_id !== taskData.taskid) {
          //this wasn't meant for us, move on
          return;
        }
        //trailer ended
        log('removing listener');
        io.socket.removeListener('palancas-update', handleTaskResult);
        btn.stop();

        alert($taskName.text() + ' completed');

        new JobResultView({
          data: data,
          container: $taskDiv[0],
          onClose:function(){
          }
        });
      };

      io.socket.on('palancas-update', handleTaskResult);

      $.post("/palanca/trigger", {
        task_id: taskData.taskid,
        service_id: taskData.taskresourceid,
        username: taskData.username
      }).fail(function(xhr, status, message) {
        log('fail');
        log(arguments);
        // TO DO:
        // handle if xhr.responseText is json or not

        var fauxMessage = {
          task_id: taskData.taskid,
          result: {
            stdout: JSON.stringify({state: 'failure', data: message || 'Network error' }),
            stderr: ""
          }
        };

        handleTaskResult(fauxMessage);
      });
    });
  });



  // bulkRunner click event handler
  $('.bulkRunner').on('click', function(evt){
    var elem = this;
    bootbox.confirm('With great power comes great responsibility',function(confirmed){
      if( !confirmed ) return;

      var $tasks = $('.tasks-panel .js-searchable-item:visible');
      if(!$tasks.length) return;

      $(elem).data('laddaIsRunning',true);

      var taskQueue = {};

      // handles palancas-update io.socket event
      var handleTaskResult = function(data) {
        if(!taskQueue[data.task_id]) {
          //this wasn't meant for us, move on
          return;
        }

        new JobResultView({
          data: data,
          container: taskQueue[data.task_id].element,
          onClose:function(){
          }
        });

        //stop button and remove from queue
        taskQueue[data.task_id].laddaButton.stop();
        // taskQueue[data.task_id].laddaButton.remove();
        delete taskQueue[data.task_id];

        if(Object.keys(taskQueue).length < 1) {
          //trailer ended
          log('removing listener');
          io.socket.removeListener('palancas-update', handleTaskResult);
          btn.stop();
          $(elem).data('laddaIsRunning', false);
          alert('All tasks processed. You\'re most welcome.');
        }
      };
      io.socket.on('palancas-update', handleTaskResult);

      $tasks.each(function(i,e){
        // for a task to be runnable the .js-searchable-item:visible
        // has to have a .data().taskId and a .trigger-task button
        var taskData = $(e).data();
        var triggerButtons = $(e).find('.trigger-task');
        if(!taskData.taskid || !triggerButtons.length) {
          return;
        }
        $(e).find('.panel-title-content').first().removeClass('alert-danger');

        //get button ELEMENT (not jQ)
        var playButton = $(e).find('.trigger-task')[0];
        taskQueue[taskData.taskid] = {
          element: e,
          laddaButton: Ladda.create(playButton).start()
        };

        $.post("/palanca/trigger", {
          task_id: taskData.taskid,
          service_id: taskData.taskresourceid,
          username: taskData.username
        }
        ).fail(function(xhr, status, message) {
          log('fail');
          log(arguments);

          var fauxMessage = {
            task_id: taskData.taskid,
            result: {
              stdout: JSON.stringify({state: 'failure', data: message || 'Network error' }),
              stderr: ""
            }
          };

          handleTaskResult(fauxMessage);
        });
      });

      var btn = Ladda.create(elem);
      btn.start();

    });
  });
}

(function (io) {
  function subscribeToEvents () {
    log('initializing monitor events');

    io.socket.on('events-update', function(resource) {
      log('monitor event update received');
      log(resource);

      if( resource.event == "host_registered" ){
        return document.location.reload();
      }

      if( !resource.type || resource.type!='agent' ) {
        var iconsDicc = {
          normal: "icon-check",
          failure: "icon-warn",
          updates_stopped: "icon-error",
          unknown: "icon-nonsense"
        };

        //row of the host
        var $rowItem = $('tr.resource'+resource.id).closest('.itemRow');

        //table tr with host entry
        var $tr = $('tr.resource'+resource.id, $rowItem);
        $('span.state_text', $tr).text(resource.state);
        $('span.state_last_update', $tr).text(resource.last_update_moment);
        $('.state-icon', $tr).removeClass("icon-check icon-warn icon-error");
        $('.state-icon', $tr).addClass(iconsDicc[resource.state]);

        var worstState = "normal";
        //determine row icon based on worst status on table
        if(resource.state == "updates_stopped") {
          worstState = resource.state;
        }else if( $('tr span.state-icon.icon-error', $rowItem).length ) {
          worstState = "updates_stopped";
        }else if ( $('tr span.state-icon.icon-warn', $rowItem).length ) {
          worstState = "failure";
        }

        $('.state-icon',$rowItem)
          .first()
          .attr('data-original-title', worstState)
          .tooltip('fixTitle')
          .removeClass("icon-check icon-warn icon-error")
          .addClass(iconsDicc[worstState]);

        if( ! $searchbox.searching ) checkAllUpAndRuning() ;
      }
    });

    io.socket.post('/events/subscribe', {}, function resourceSocketSubscription(data, jwres) {
      log('subscribed to event updates');
    });
  }

  function subscribeToTriggers () {
    log('initializing task triggers');
    io.socket.post('/palanca/subscribe', { customer: Cookies.getJSON('theeye').customer }, function (data, jwres){
      // log(data);
      // log(jwres);
      log('subscribed to trigger updates');
    });
  }

  // var log = debug('eye:web:events');
  if( io.socket.socket && io.socket.socket.connected ) {
    log('socket already connected, subscribing...');
    subscribeToEvents();
    subscribeToTriggers();
  }

  io.socket.on("connect",function(){
    log('socket connected! subcribing...');
    subscribeToEvents();
    subscribeToTriggers();
  });

  triggers(io);

})(window.io);

(function setupGroupables(){
  //skip if not in test route / path
  if (!/events\/test/.test(window.location.pathname)) return;
  //setup
  var $monitorsAccordion = $('#accordion');
  var $monitorsContainer = $('#monitorsContainer');
  var $groupAccordion = $('#groupaccordion');
  var $groupBody = $('#group-body', $groupAccordion);
  var $groupTitle = $('#group-title', $groupAccordion);
  var $tagContainer = $('.tagger');

  /* takes the hash from url. Hash must be in the form of groupby=TAG
   * Can be called from button handler and/or page load
   */
  var groupBasedOnHash = function(){
    var hashParams = getHashParams();
    // should we remove any search here?
    //first, any .itemRow in the groups container must be returned to #accordion
    $('.itemRow', $groupAccordion).appendTo($monitorsAccordion);
    if(!hashParams.groupby) {
      $groupAccordion.slideUp(200);
      $monitorsContainer.slideDown(200);
      return;
    }
    //then, search for .itemRow in #accordion that matches tag
    //and move it into groupaccordion body
    $('.itemRow', $monitorsAccordion).each(function(i,e){
      var $row = $(e);
      var itemTags = $row.data('tagArray');
      // !!~ bitwise indexOf to boolean
      // si, puedo usar !== -1, pero los bitwise operands son mucho mas rapidos y consumen menos
      if(!!~itemTags.indexOf(hashParams.groupby)) {
        $row.appendTo($groupBody);
      }
      $groupTitle.text(hashParams.groupby);
      $groupAccordion.slideDown(200);
      $monitorsContainer.slideUp(200);
    });
    //get the button matched by tag
    var $tagButton = $('.tag-grouper', $tagContainer)
      .filter(function(i,e){
        return $(e).text() == hashParams.groupby;
      }).first();
    // this means the groupBasedOnHash came from page load, not button click
    // call toggleTagButtonState so the button reflects tag selection
    if($tagButton.length > 0 && !$tagButton.hasClass('active')) {
      //no tag button for specified tag, weird
      toggleTagButtonState($tagButton);
    }
  };
  /* get tags from all .itemRow
   * @returns array with unique values and empty/falsy tags removed
   */
  var getAllTags = function(){
    var tagString = "";
    $('.itemRow').each(function(i,e){
      var itemTags = $(e).data('tags');
      tagString += "," + itemTags;
      //since we are here, turn tags into array and store in element
      $(e).data('tagArray', itemTags.split(','));
    });
    var allTags = _.chain(tagString.split(','))
      .uniq()
      .compact()
      .value();
    return allTags;
  };
  /* handles toggle button state, must be called with a jQueried object (the button to handle)
   * Reverts buttons.tag-grouper to btn-info, removes btn-warning and active class, resets rotateX.
   * Adds classes active & btn-warning and rotateX(360) to passed button
   * @returns true/false based on whether the button ends active or not
   */
  var toggleTagButtonState = function($el) {
    //all tag buttons
    var $buttons = $('.tag-grouper', $tagContainer)
      .removeClass('btn-warning')
      .addClass('btn-info');
    $buttons.filter('.active')
      .css('transform','rotateX(-360deg)');

    if($el.hasClass('active')){
      $el.removeClass('active');
      return false;
    }else{
      // reset rotate for previous active button
      // remove active class from all buttons
      $buttons.removeClass('active');
      $el.addClass('active')
        .css('transform','rotateX(360deg)')
        .removeClass('btn-info')
        .addClass('btn-warning');
      return true;
    }
  };
  /*
   * Handles click on tag-grouper buttons
   * Determines if button should enable/disable group by tag
   * Sets window.location.hash on empty||button.text
   * Calls groupBasedOnHash
   */
  var tagButtonHandler = function(event){
    event.preventDefault();

    var $button = $(event.target);
    var active = toggleTagButtonState($button);
    var tag = $button.text();
    if(!active) {
      window.location.hash = '';
    }else{
      window.location.hash = 'groupby=' + encodeURIComponent(tag);
    }
    groupBasedOnHash();
  };
  // creates & returns a button.btn.btn-xs.[btn-info||btn-warning]
  var createTagButton = function(text){
    var hashParams = getHashParams();
    var buttonClass= hashParams.groupby && hashParams.groupby == text ? 'btn-warning' : 'btn-info';
    return $('<button />')
      .addClass('btn btn-xs tag-grouper')
      .addClass(buttonClass)
      .on('click', tagButtonHandler)
      .text(text);
  };

  var collectTagsAndBuildButtons = function(){
    getAllTags().forEach(function(e,i){
      $tagContainer.append(createTagButton(e));
    });
  };
  collectTagsAndBuildButtons();
  groupBasedOnHash();
  //una vez agrupados hay que "heredar" los events de los monitors
  //tiene que tener un icono heredado del peor estado de los monitors que haya dentro
})();

var createItemRows = function(resources) {

};

var ItemRowView = function(options){
  var resource = options.data;
  var $container = $('<div />')
    .addClass('itemRow resource-container panel panel-default js-searchable-item')
    .attr('id', resource.id)
    .data('item', resource)
    .data('tags', resource.tags);
  var overallState = resource.state;
  var tags = [
    resource.id,
    resource.description,
    resource.name,
    "hostname=" + resource.hostname,
    "type=" + resource.type,
    "state=" + resource.state
  ];

  // resource.subs.forEach(function(subresource){
  //   if(statesDicc[subresource.state] > statesDicc[overallState]) {
  //     overallState = subresource.state;
  //   }
  //   tags.push(subresource.id);
  //   tags.push(subresource.description);
  //   tags.push(subresource.name);
  //   tags.push(subresource.hostname);
  //   tags.push(subresource.type);
  //   tags.push("state=" + subresource.state);
  //   tags.concat(subresource.tags);
  // });

  var monitorTags = resource.monitor && resource.monitor.tags ? resource.monitor.tags: [];
  tags = tags.concat(monitorTags).join(',');

};

//
// auto focus search input on keypress
//
$(document).on('keypress',function(){
  $('.js-searchable-box input').focus();
});

new Clipboard('.clipboard-btn');

$('.allUpNrunning').on('click',function(){ $('.allUpNrunning').slideUp(); $('.resources-panel-list').slideDown(); });
