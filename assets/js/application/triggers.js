/* global Ladda, $searchbox, bootbox, debug */
// Simple log function to keep the example simple
function log() {
  var deb = debug('eye:web:triggers');
  deb.apply(deb, arguments);
}

//ye old code
// function trigger(event, task_id, resource_id, username) {
//   var elem = this;
//   event.preventDefault();
//   event.stopPropagation();
//
//   bootbox.confirm('Trigger Task?',function(confirmed){
//     if( !confirmed ) return;
//
//     var taskResultHandler = function(laddaBtn) {
//
//       function onServerSentTaskResult(task, btn, handler) {
//         btn.stop();
//         io.socket.removeListener("palancas-update", handler);
//
//         var $tpl = $('div.resultTemplate div').clone();
//         $tpl.find('.scriptStdout').html(task.result.stdout);
//         $tpl.find('.scriptStderr').html(task.result.stderr);
//         //$tpl.find('.scriptResCode').html(task.result.code);
//
//         var $resultContainer = $("div#result_container");
//         $resultContainer.append( $tpl.html() );
//       }
//
//       function handler (task) {
//         log('task updates received');
//         log(task);
//         onServerSentTaskResult(task, laddaBtn, handler);
//       }
//
//       return handler;
//     }
//
//     var btn = Ladda.create(elem);
//     btn.start();
//
//     io.socket.on('palancas-update', taskResultHandler(btn));
//
//     var id = resource_id;
//     $.post("/palanca/trigger", {
//       task_id: task_id,
//       service_id: id,
//       username: username
//     }, function(data) {
//       var newJob = data.job;
//       //alert("You triggered task '" + newJob.name + "'");
//     }).done(function(data, event_type, xhr) {
//       //alert(data.message);
//     }).fail(function(xhr) {
//       var data = JSON.parse(xhr.responseText);
//       alert(data.message);
//       btn.stop();
//     });
//
//   });
//
//   return;
// }

(function triggers(io){
  console.log('initializing triggers');
  // var socket = io.socket;
  // for some reason, assigning the var socket was messing in firefox
  // maybe io.socket has some (if(instanceof this !== 'whateverClass') return new whateverClass())
  function onSocketIoConnect(){
    console.log('onSocketIoConnect fired');
    io.socket.post('/palanca/subscribe', {}, function (data, jwres){
      //esto no esta sucediendo
      console.log('palanca/subscribe posted');
    });
  }

  if( io.socket.socket && io.socket.socket.connected ) {
    onSocketIoConnect();
  }
  log('listening sockets connect');
  io.socket.on("connect",onSocketIoConnect);

  /////////////////////////////////////////////
  // bulkRunner initialization
  /////////////////////////////////////////////

  // listen search:start and show bulkRunner button
  // unless there are no visible tasks in the div.tasks-panel
  $searchbox.on('search:start', function(evt){
    console.log('search:start');
    if(!$('.tasks-panel .js-searchable-item:visible').length) {
      $('.bulkRunner').hide();
      return;
    }
    $('.bulkRunner').show();
  });

  // listen search:done and show bulkRunner button
  // except: runner is running || no visible tasks in div.tasks-panel
  $searchbox.on('search:done', function(evt){
    console.log('search:done');
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

  // new task runner click handler
  $('.trigger-task').on('click', function(evt){
    evt.preventDefault();
    evt.stopPropagation();

    var elem = this;
    var $taskTitleContent = $(elem).closest('.panel-title-content').first();
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

      // fetches template from first div in div.resultTemplate
      // makes clone and removes from dom
      // uses passed element's data.lastRun to show result of task ran
      var lastRunToCollapsible = function(element) {
        var $elem = $(element);
        var data = $elem.data('lastRun');
        //evaluate result
        //have to guess if its json or not
        var stdout;
        var failed;
        try{
          stdout = JSON.parse(data.result.stdout);
          failed = stdout.state != 'normal';
        }catch(e){
          //probably text string
          stdout = data.result.stdout;
          failed = stdout.trim() != 'normal';
        }

        $taskTitleContent.addClass(failed ? 'alert-info' : '');
        var $tpl = $('div.resultTemplate div').first().clone().remove();
        $tpl.one('close.bs.alert', function(){
          $taskTitleContent.removeClass('alert-info');
        });
        $tpl.find('.scriptStdout').html(data.result.stdout);
        $tpl.find('.scriptStderr').html(data.result.stderr);
        // $tpl.addClass('col-md-12');
        $elem.find('.panel-body').append($tpl);
      };

      // handles palancas-update io.socket event
      var handleTaskResult = function(data) {
        if(data.task_id !== taskData.taskid) {
          //this wasn't meant for us, move on
          return;
        }
        //trailer ended
        console.log('removing listener');
        io.socket.removeListener('palancas-update', handleTaskResult);
        btn.stop();

        alert($taskName.text() + ' completed');

        //append data to task row element
        $taskDiv.data('lastRun', data);
        lastRunToCollapsible($taskDiv[0]);
      };

      io.socket.on('palancas-update', handleTaskResult);

      $taskTitleContent.removeClass('alert-info');

      $.post("/palanca/trigger", {
        task_id: taskData.taskid,
        service_id: taskData.taskresourceid,
        username: taskData.username
      }).fail(function(xhr, status, message) {
        console.log('fail');
        console.log(arguments);
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

      var tasks = $('.tasks-panel .js-searchable-item:visible');
      if(!tasks.length) return;

      $(elem).data('laddaIsRunning',true);

      var taskQueue = {};

      // fetches template from first div in div.resultTemplate
      // makes clone and removes from dom
      // uses passed element's data.lastRun to show result of task ran
      var lastRunToCollapsible = function(element) {
        var $elem = $(element);
        var data = $elem.data('lastRun');
        //evaluate result
        //have to guess if its json or not
        var stdout;
        var failed;
        try{
          stdout = JSON.parse(data.result.stdout);
          failed = stdout.state != 'normal';
        }catch(e){
          //probably text string
          stdout = data.result.stdout;
          failed = stdout.trim() != 'normal';
        }

        $elem.find('.panel-title-content').first().addClass(failed ? 'alert-danger' : '');
        var $tpl = $('div.resultTemplate div').first().clone().remove();
        $tpl.find('.scriptStdout').html(data.result.stdout);
        $tpl.find('.scriptStderr').html(data.result.stderr);
        // $tpl.addClass('col-md-12');
        $elem.find('.panel-body').append($tpl);
      };

      // handles palancas-update io.socket event
      var handleTaskResult = function(data) {
        if(!taskQueue[data.task_id]) {
          //this wasn't meant for us, move on
          return;
        }
        //append data to task row element
        $(taskQueue[data.task_id].element).data('lastRun', data);
        lastRunToCollapsible(taskQueue[data.task_id].element);

        //stop button and remove from queue
        taskQueue[data.task_id].laddaButton.stop();
        // taskQueue[data.task_id].laddaButton.remove();
        delete taskQueue[data.task_id];

        if(Object.keys(taskQueue).length < 1) {
          //trailer ended
          console.log('removing listener');
          io.socket.removeListener('palancas-update', handleTaskResult);
          btn.stop();
          $(elem).data('laddaIsRunning', false);
          alert('All tasks processed. You\'re most welcome.');
        }
      };

      io.socket.on('palancas-update', handleTaskResult);

      tasks.each(function(i,e){
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
        //can't/shouldn't do anything but failing
        // , function(data) {
        //   // var newJob = data.job;
        //   console.log('callback');
        //   //alert("You triggered task '" + newJob.name + "'");
        // }).done(function(data, event_type, xhr) {
        //   //alert(data.message);
        //   console.log('done');
        // }
        ).fail(function(xhr, status, message) {
          console.log('fail');
          console.log(arguments);
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

      var btn = Ladda.create(elem);
      btn.start();

    });
  });
})(window.io);
