/* global getHashParams, debug, $searchbox, log, Ladda, bootbox, Cookies, Clipboard, _ */
$(function(){

  var iconsDicc = {
    unknown         : "icon-nonsense",
    normal          : "icon-check",
    low             : "icon-info", /* failure state */
    high            : "icon-warn", /* failure state */
    critical        : "icon-fatal", /* failure state */
    updates_stopped : "icon-error",
    getIcon: function (state) {
      var icon = (this[state.toLowerCase()]||this.unknown);
      return icon;
    },
    indexOf: function (value) {
      // keep the indexes in order !
      return [
        "unknown",
        "normal",
        "low",
        "high",
        "critical",
        "updates_stopped"
      ].indexOf(value);
    },
    classToState: function (iconClass) {
      var self = this;
      var elems = Object.keys(self).filter(function(state){
        if (self[state]==iconClass) return state;
      });
      return elems[0];
    },
    filterAlertIconClasses: function(iconClasses) {
      var failureClasses = [
        'icon-info',
        'icon-warn',
        'icon-fatal',
        'icon-error',
        'icon-nonsense'
      ],
        filtered = iconClasses.filter(function(idx,icon){
          return failureClasses.indexOf(icon) != -1
        });
      return filtered;
    }
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
    var $items = $('.itemRow');
    var iconClasses = $('tr td span.state-icon').map(function(i,el){
      return $(el).attr('class').split(' ')[1];
    });
    var showAlerts = iconsDicc.filterAlertIconClasses(iconClasses).length > 0;

    if (showAlerts) {
      $items.sort(function(a,b){
        // sort! only if any has some failure/warning
        function getSortOrder (el) {
          var stateIcon = $('.state-icon',el).first()[0];
          var iconClass = stateIcon.classList.value.split(" ")
            .find(function(cls){
              return cls.indexOf('icon-') === 0;
            });

          return iconsDicc.indexOf(iconsDicc.classToState(iconClass));
        }
        var orderA = getSortOrder(a);
        var orderB = getSortOrder(b);
        return orderA < orderB;
      }).prependTo('#accordion');

      $upNrunning.slideUp();
      $resourcesList.slideDown();

      $items.each(function(){
        var $row = $(this),
          stateIcon = $row.find('.panel-heading .state-icon')[0],
          iconClass = stateIcon.className.match(/icon-[a-z]*[ ]?/)[0].trim();
        
        if (iconsDicc.filterAlertIconClasses( $([iconClass]) ).length === 0) {
          $row.appendTo( $('[data-hook=hidden-resources-container]') );
        }
      });
      resourcesFolding.showButton();
    } else {
      $upNrunning.slideDown();
      $resourcesList.slideUp();
      $items.appendTo('.resources-panel-list #accordion');
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
    // copy paste de dashboard/page
    var LastEventView = BaseView.extend({
      template: Templates['assets/templates/dashboard/monitor-last-event.hbs'],
      render:function(){
        BaseView.prototype.render.apply(this, arguments);
        this
          .queryByHook('container')
          .jsonViewer( this.model.get('last_event') );
      }
    });
    $('[data-hook=last_event]').on('click',function(event){
      event.preventDefault();
      event.stopPropagation();

      $.ajax({
        method:'get',
        url:'/api/resource/' + event.currentTarget.dataset.id
      }).done(function(resource){

        var content = new LastEventView({
          model: new Backbone.Model(resource)
        });
        content.render();

        var modal = new Modal({
          backdrop: false,
          save_button: false,
          'title': 'Last Event'
        });
        modal.render();
        modal.content = content;
        modal.$el.on('hidden.bs.modal',function(){
          modal.remove();
          content.remove();
        });
        modal.show();

      });
      return false;
    });

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

  function triggers (io) {
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
      var data = options.data, $tpl;

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

        if (!resource.type||resource.type!='agent') {
          //row of the host
          var $rowItem = $('tr.resource'+resource.id).closest('.itemRow');

          //table tr with host entry
          var $tr = $('tr.resource'+resource.id, $rowItem);
          $('span.state_text', $tr).text(resource.state);
          $('span.state_last_update', $tr).text(resource.last_update_moment);
          $('.state-icon', $tr).removeClass().addClass('state-icon');

          // if state is failure use the failure_severity property for the icon
          var stateSeverity = resource[(resource.state==='failure')?'failure_severity':'state'];
          $('.state-icon', $tr).addClass(iconsDicc.getIcon(stateSeverity));

          var worstState, elems = $('tr td span.state-icon', $rowItem);
          if (elems.length!==0) {
            var iconClasses = elems.map(function(i,el){
              return $(el).attr('class').split(' ')[1];
            });
            var sortedIconClasses = iconClasses.sort(function(a,b){
              // sort by state
              var orderA = iconsDicc.indexOf(iconsDicc.classToState(a));
              var orderB = iconsDicc.indexOf(iconsDicc.classToState(b));
              return orderA < orderB;
            });
            worstState = iconsDicc.classToState(sortedIconClasses[0]);
          } else {
            worstState = stateSeverity;
          }

          $('.state-icon',$rowItem)
            .first()
            .attr('data-original-title', worstState)
            .tooltip('fixTitle')
            .removeClass()
            .addClass('state-icon ' + iconsDicc.getIcon(worstState));

          if (!$searchbox.searching) checkAllUpAndRuning();
        }
      });

      io.socket.post('/events/subscribe', {}, function resourceSocketSubscription(data, jwres) {
        log('subscribed to event updates');
      });
    }

    function subscribeToTriggers () {
      log('initializing task triggers');
      io.socket.post('/palanca/subscribe', { customer: Cookies.getJSON('theeye').customer }, function (data, jwres){
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

  //
  // auto focus search input on keypress
  //
  $(document).on('keypress',function(){
    $('.js-searchable-box input').focus();
  });

  new Clipboard('.clipboard-btn');

  $('.allUpNrunning').on('click',function(){
    $('.allUpNrunning').slideUp(); 
    $('.resources-panel-list').slideDown(); 
  });


});
