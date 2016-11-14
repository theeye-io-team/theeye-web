/* global Select2Data, Tags, FormElement, bootbox, humanInterval, lodash, $searchbox, ScraperModal */
$(function(){

  window.scriptState = window.scriptState ? window.scriptState : $({});
  var $state = window.scriptState;

  var _users = new App.Collections.Users();
  _users.fetch({
    data:{ where:{
      $and:[
        {credential: { $ne:'agent' }},
        {credential: { $ne:'viewer' }},
      ]
    } },
    success:initialize,
    failure:failure
  });
  window.Users = _users;

  function failure () {
    bootbox.alert('an error has ocurred.');
  }

  function initialize () {
    $('#script-modal').on('hidden.bs.modal', function(){
      $('body').addClass('modal-open');
    });

    (function update (el){
      var $taskForm = $(el);

      $taskForm.find('select[name=host_id]').select2({ placeholder: 'Choose a host' });
      $taskForm.find('select[name=script_id]')
        .select2({ allowClear:true, placeholder: 'Choose a script' })
        .on('change', function(event){
          if($(this).val()) {
            $('a.scripter', $taskForm)
              .text('Update script')
              .removeClass('createScript')
              .addClass('editScript')
              .data('script-id', $(this).val());
          }else{
            $('a.scripter', $taskForm)
              .text('Create script')
              .removeClass('editScript')
              .addClass('createScript')
              .data('script-id', null);
          }
        });
      $taskForm.find('select[name=tags]').select2({ placeholder: 'Choose tags', data: Select2Data.PrepareTags(Tags), tags: true });
      $taskForm.find('select[name=triggers]').select2({ placeholder: 'Events', data: Select2Data.PrepareEvents( window.Events ) });

      var usersSelect = new UsersSelect({ collection: _users });
      usersSelect.render();

      $taskForm.find('[data-hook=advanced]').append( usersSelect.$el );

      $('.editTask').on('click', function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var taskId = $(this).closest('.itemRow').data('item-id');
        $taskForm.data('task-id',taskId);
        $taskForm.data('action','edit');

        $taskForm[0].reset();

        jQuery.ajax({
          type:'get',
          url: '/task/' + taskId
        }).done(function(task){

          $('#name',$taskForm).focus();

          var form = new FormElement( $taskForm[0] );
          form.set( task );
          $('.modal#edit-task').on('shown.bs.modal', function(){
            $('select[data-hook=script_id]').trigger('change');
          });
          $('.modal#edit-task').modal('show');

        }).fail(function(xhr, err, xhrStatus) {
          alert(xhr.responseText);
        });
      });

      $('.modal#edit-task button[type=submit]').on('click',function(event){
        $taskForm.submit();
      });

      $taskForm.on("submit", function(event){
        event.preventDefault();

        var form = new FormElement($taskForm);
        var vals = form.get();
        vals.type = 'script';

        // parse arguments
        var args = vals.script_arguments.split(',');
        vals.script_arguments = args.map(function(str){ return str.trim(); });

        jQuery.ajax({
          type:'PUT',
          url:'/task/' + $taskForm.data('task-id'),
          data: JSON.stringify(vals),
          contentType: "application/json; charset=utf-8"
        }).done(function(task) {
          $(".modal#edit-task").modal("hide");
          window.location.reload();
        }).fail(function(xhr, err, xhrStatus) {
          alert( xhr.responseText );
        });

        return false; // stopPropagation from within the flow
      });

      return $taskForm;
    })("form#editTaskForm");

    (function create(el){
      var $taskForm = $(el);
      var $multihostContainer = $taskForm.find('.hidden-container.multiple-hosts-selection');

      $taskForm.find('select[name=hosts_id]').select2({ placeholder: 'Type a hostname or hit Enter to list' });
      $taskForm.find('select[name=script_id]')
        .select2({ allowClear:true, placeholder: 'Choose a script' })
        .on('change', function(event){
          if($(this).val()) {
            $('a.scripter', $taskForm)
              .text('Update script')
              .removeClass('createScript')
              .addClass('editScript')
              .data('script-id',event.currentTarget.value);
          }else{
            $('a.scripter', $taskForm)
              .text('Create script')
              .removeClass('editScript')
              .addClass('createScript')
              .data('script-id', null);
          }
        });
      $taskForm.find('select[name=tags]').select2({ placeholder:'Tags', tags:true, data: Select2Data.PrepareTags(Tags) });
      $taskForm.find('select[name=triggers]').select2({ placeholder: 'Events', data: Select2Data.PrepareEvents( window.Events ) });

      var usersSelect = new UsersSelect({ collection: _users });
      usersSelect.render();

      $taskForm.find('[data-hook=advanced]').append( usersSelect.$el );

      $(".modal#create-task").on('shown.bs.modal', function(event) {
        $taskForm[0].reset();
        $taskForm.data('action','create');
        $taskForm.find('[data-hook=name]').focus();

        //reset script button to default state
        $('a.scripter', $taskForm)
          .text('Create script')
          .removeClass('editScript')
          .addClass('createScript')
          .data('script-id', null);

        $multihostContainer.show();
      });

      $(".modal#create-task button[type=submit]").on('click',function(event){
        $taskForm.submit();
      });

      $state.on('script_uploaded', function(ev, script) {
        if(location.pathname != '/admin/task') {
          //restrict the event function to the /admin/task layout
          return;
        }
        alert('Script succesfully uploaded','Script upload', function() {
          $('[data-hook=script_id]').each(function(index, element){
            if($(element).val()) {
              return;
            }
            $(element).append($('<option>', {
              value: script.id,
              text: script.filename
            }));
            $(element).val(script.id);
            $(element).trigger('change');
          });

          $('#script-modal').modal('hide');
          $('body').addClass('modal-open');
        });
      });

      $taskForm.on('submit', function(event) {
        event.preventDefault();

        var form = new FormElement($taskForm);
        var vals = form.get();
        vals.type = 'script';

        // parse arguments
        var args = vals.script_arguments.split(',');
        vals.script_arguments = args.map(function(str){ return str.trim(); });

        $.ajax({
          method:'POST',
          url:'/task',
          data: JSON.stringify(vals),
          contentType: 'application/json; charset=utf-8'
        }).done(function(task) {
          $('.modal#create-task').modal('hide');
          alert('Task Created','Task', function(){
            window.location.reload();
          });
        }).fail(function(xhr, err, xhrStatus) {
          alert(err);
        });

        return false; // stopPropagation from within the flow
      });
    })('form#createTaskForm');

    (function remove(){
      $('.deleteTask').on('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var itemRow = $(this).closest('.itemRow');

        bootbox.confirm('The resource will be removed. Want to continue?',
          function(confirmed) {
            if(!confirmed) return;
            $.ajax({
              url: '/task/' + itemRow.data().itemId,
              type: 'DELETE'
            }).done(function(response) {
              itemRow.remove();
              // location.reload();
            }).fail(function(xhr, err, xhrStatus) {
              alert(xhr.responseText);
            });
          }
        );
      });
    })();

    (function schedule(){
      var $mainModal = $('#schedule-task-modal');
      var $deleteModal = $('#schedule-delete-modal');
      var $form = $('form', $mainModal);
      var $submitter = $('button[type=submit]',$mainModal);
      var $scheduleDeleter = $('.deleteSchedule', $deleteModal);
      var $calendarElement, scheduleData;

      function buildEventSeries(title, startingDate, interval) {
        var events = [];
        interval = interval ? humanInterval(interval) : false;
        //60 iterations / dates
        if(interval) {
          for(var ii = 0; ii < 60; ii++) {
            events.push({
              title: title,
start: new Date(startingDate + (interval * ii))
          });
          }
        }else{
          events.push({
            title: title,
start: new Date(startingDate)
        });
        }
        return events;
      }

      function getEventSources(scheduleData, name) {
        return lodash.map(scheduleData, function(scheduleEvent, index, arr){
          var ms = new Date(scheduleEvent.data.scheduleData.runDate);
          // 200 is the offset of the color wheel where 0 is red, change at will.
          // 180 is how wide will the angle be to get colors from,
          // lower (narrower) angle will get you a more subtle palette.
          // Tone values are evenly sparsed based on array.length.
          // Check this: http://www.workwithcolor.com/hsl-color-picker-01.htm
          var wheelDegree = 200 + 180 / arr.length * ++index;
          return {
            id: scheduleEvent._id,
            backgroundColor: 'hsl('+wheelDegree+', 80%, 48%)',
            textColor: 'white',
            className: ["calendarEvent"],
scheduleData: scheduleEvent,
  events: buildEventSeries(
    name,
    ms.valueOf(),
    scheduleEvent.data.scheduleData.repeatEvery
  )
          };
        });
      }

      function showDeleteModal(eventObject) {
        var eventData = eventObject.source.scheduleData;
        $deleteModal.modal('show');

        // TODO potential bug here
        // If agenda has been stopped for any period of time, when it's
        // started again it will check for scheduled jobs that SHOULD HAVE RAN
        // while it was stopped. Any job that fits this situation will be run
        // when agenda is started. Hence this problem occurs: lastRun is set to
        // the re-start moment and nextRun RE-CALCULATED based on schedule
        // repeat interval. In an ideal world the agenda would never be stopped,
        // but if it happens, then the event series estimation (UI) will differ from
        // what's really gonna happen with the schedule (DB). --cg
        $('.startsOn', $deleteModal).text(new Date(eventData.data.scheduleData.runDate));
        $('.repeatEvery', $deleteModal).text(eventData.data.scheduleData.repeatEvery || "Never");

        // this two are hidden till we figure out how last/next Run is really set
        $('.lastRun', $deleteModal).text(eventData.lastRunAt);
        $('.nextRun', $deleteModal).text(eventData.nextRunAt);

        $scheduleDeleter.data('schedule', eventObject);
      }
      //fix para el scroll despues de abrir modal sobre modal
      $deleteModal.on('hidden.bs.modal', function(event){
        $('body').addClass('modal-open');
      });

      //mode selector
      $('input[name=mode]').on('change', function(evt){
        if($(this).val() == 'human') {
          $('div.human').removeClass('hidden');
          $('div.cron').addClass('hidden');
        }else{
          $('div.cron').removeClass('hidden');
          $('div.human').addClass('hidden');
        }
      });

      //show modal on scheduleTask click
      $('.scheduleTask').click(function(evt){
        evt.preventDefault();
        evt.stopPropagation();

        scheduleData = [];
        var itemData = $(this).closest('.itemRow').data();
        //esto tiene que apuntar a /task/:id/schedule
        $.get("/task/" + itemData.itemId + "/schedule").done(function(data){
          scheduleData = getEventSources(data.scheduleData, itemData.itemName);
          //prepare form
          $form.data('task-id',itemData.itemId);
          //prepare modal
          $('h4.modal-title', $mainModal).text('Schedule task: ' + itemData.itemName);
          $('input[name=datetime]').val('');
          $('input[name=frequency]').val('');

          //calendar stuff on event handler below
          $mainModal.modal('show');

        }).fail(function(xhr, err, xhrStatus) {
          alert(xhr.responseText);
        });
        return;
      });

      //initialize calendar only once
      $mainModal.on('shown.bs.modal', function(event) {
        if(!$calendarElement) {
          $calendarElement = $('.taskScheduleCalendar', $mainModal).fullCalendar({
            eventClick: showDeleteModal
          });
        }
        scheduleData.forEach(function(item){
          $calendarElement.fullCalendar('addEventSource', item);
        });

      });
      $mainModal.on('hide.bs.modal', function(event) {
        $calendarElement.fullCalendar('removeEventSources');
        scheduleData = [];
      });

      $submitter.click(function(evt){
        var datetime = $('input[name=datetime]',$form).datetimepicker('getValue');
        var frequency = $('input[name=frequency]', $form).val();
        //SCHEDULE!!!
        $.post("/task/schedule", {
          task: $form.data('task-id'),
          scheduleData: {
            repeatEvery: frequency,
            runDate: datetime
          }
        }).done(function(data,status,xhr){
          alert("All right! Your task will run on: " + data.nextRun, function(){
            $mainModal.modal('hide');
          });
        }).fail(function(xhr, status, message) {
          console.log('fail');
        });
      });

      $scheduleDeleter.click(function(evt){
        evt.preventDefault();

        var scheduleData = $(this).data('schedule');
        if(!scheduleData.source.id) {
          console.log('Error, schedule ID not set');
          console.log($(this).data());
          return;
        }
        //confirm and request DELETE
        bootbox.confirm('The schedule will be canceled. Want to continue?',
          function(confirmed) {
            if(!confirmed) return;
            $.ajax({
              url: '/task/' + scheduleData.source.scheduleData.data.task_id +
              '/schedule/' + scheduleData.source.id,
              type: 'DELETE'
            }).done(function(data) {
              $deleteModal.modal('hide');
              $calendarElement.fullCalendar('removeEventSource', scheduleData.source);
            }).fail(function(xhr, err, xhrStatus) {
              alert(xhr.responseText);
            });
          }
        );
      });

      //catch form submit
      $form.on('submit', function(evt){
        evt.preventDefault();
      });

      //datetime picker
      //http://xdsoft.net/jqplugins/datetimepicker/
      $('input[name=datetime]').datetimepicker({
        minDate: 0,
        allowBlank: true,
        closeOnDateSelect:false
      });
    })();

    // MASS DELETE
    (function massDelete(){
      // searchbox hook
      $searchbox.on('search:start', function() {
        $('.massChecker').trigger('uncheck');
      });
      $searchbox.on('search:empty', function() {
        $('.massChecker').trigger('uncheck');
      });

      // SETUP
      var firstConfirmHeader = '<h1>Massive task delete</h1>Heads up!<br /><br />';
      var firstConfirmFooter = '<br />will be deleted.<h2>Are you sure?</h2>';
      var secondConfirmHeader = '<h1>Wait, really sure?</h1>' +
        'Please review the list, just in case:<br /><br />';
      var secondConfirmFooter = '<br />WILL BE DELETED<h2>Confirm wisely</h2>';
      var successTitle = 'Tasks deleted';
      var successFooter = '<br/>...you will be missed :(';
      var failTitle = 'Tasks deleted (some)';
      var failFooter = '<br/>...I tried to delete these tasks' +
        ' yet some of them came back with errors.' +
        '<br /><br />Please refresh now';
      var dataId = "itemId"; // the data-something where we get the id of the item
      var dataDescriptor = "itemName"; // the data-something where we get the name of the item
      var listTemplate = "{descriptor} ({id})<br />";
      var itemSelector = 'div.itemRow.selectedItem:visible';
      var apiUrlEndpoint = '/task/';
      var apiRequestType = 'DELETE';

      // MASS DELETE - OJO
      $('.massDelete').on('click', function(evt){
        evt.preventDefault();
        var taskRows = "";
        var taskIds = [];
        //collect selected rows.data (dataId & dataDescriptor)
        $(itemSelector).each(function(i,e){
          var itemId = $(e).data(dataId);
          var itemName = $(e).data(dataDescriptor);
          if(itemId) {
            taskIds.push(itemId);
            var listItem = listTemplate
              .replace("{id}", itemId)
              .replace("{descriptor}", itemName);
            //concatenate notification rows
            taskRows = taskRows + listItem;
          }
        });
        if(taskRows) {
          bootbox.confirm(firstConfirmHeader + taskRows + firstConfirmFooter, function(result1){
            if(!result1) {
              return;
            }
            bootbox.confirm(secondConfirmHeader + taskRows + secondConfirmFooter, function(result2){
              if(!result2) {
                return;
              }
              $.blockUI();
              var deleteRequests = [];
              var removeOnSuccess = function(id) {
                console.log('request success');
                // console.log('would remove '+'div.itemRow[data-item-id='+id+']');
                $('div.itemRow[data-item-id='+id+']').remove();
              };
              for(var ii = 0; ii < taskIds.length; ii++) {
                var taskId = taskIds[ii];
                deleteRequests.push(
                  $.ajax({
                    url: apiUrlEndpoint + taskId,
                    type: apiRequestType,
                    // on success remove div[data-item-id=itemId]
                    success: (function(id){
                      return removeOnSuccess(id);
                    })(taskId)
                  })
                );
              }

              // que es esto chris? borre todos los console.logs
              // esto agarra el array deleteRequests y ejecuta todos los requests
              // es similar a lo que haces vos con lodash.after --
              // restaure las funciones de success/fail que habias sacado
              $.when.apply($, deleteRequests)
                .then(
                  // success
                  function(){
                    alert(taskRows + successFooter, successTitle);
                  },
                  // fail
                  function(){
                    alert(taskRows + failFooter, failTitle);
                  }
                )
                .progress(function(){})
                .always(function(){ $.unblockUI(); })
                .done(function(){});
            });
          });
        }
        $(this).blur();
        return false;
      });

      // MASS CHECKER
      $('.massChecker').on('click', function(evt){
        var $this = $(this);
        evt.stopPropagation();
        var $spanIcon = $this.children('span').first();
        if($this.data('checked')) {
          //uncheck all by firing event
          $this.trigger('uncheck');
        }else{
          // do an "uncheck all", there maybe some left from a prior search
          // this should be hooked on the search event
          $('.rowSelector').trigger('uncheck');
          $('.rowSelector:visible').trigger('check');
          $this.data('checked',true);
          $spanIcon.addClass('glyphicon-check');
          $spanIcon.removeClass('glyphicon-unchecked');
        }
        $(this).blur();
      });
      $('.massChecker').on('uncheck', function(evt){
        var $this = $(this);
        var $spanIcon = $this.children('span').first();
        $this.data('checked',false);
        $spanIcon.removeClass('glyphicon-check');
        $spanIcon.addClass('glyphicon-unchecked');
        $('.rowSelector').trigger('uncheck');
      });

      // MASS CHECKER: when an item changes state it triggers
      // a itemchanged event on massChecker. On itemchanged MASS CHECKER
      // checks for an unchecked item. If any, MASS CHECKER unchecks itself
      $('.massChecker').on('itemchanged', function(evt){
        var $this = $(this);
        var $spanIcon = $this.children('span').first();
        $('.rowSelector:visible').each(function(i,e){
          if(!$(e).data('checked')) {
            $this.data('checked', false);
            $spanIcon.removeClass('glyphicon-check');
            $spanIcon.addClass('glyphicon-unchecked');
            return;
          }
        });
      });

      // ROW SELECTOR
      $('.rowSelector').on('check', function(evt){
        var $this = $(this);
        var $spanIcon = $this.children('span').first();
        $this.data('checked',true);
        $spanIcon.addClass('glyphicon-check');
        $spanIcon.removeClass('glyphicon-unchecked');
        $this.closest('.itemRow').addClass('selectedItem');
      });
      $('.rowSelector').on('uncheck', function(evt){
        var $this = $(this);
        var $spanIcon = $this.children('span').first();
        $this.data('checked',false);
        $spanIcon.removeClass('glyphicon-check');
        $spanIcon.addClass('glyphicon-unchecked');
        $this.closest('.itemRow').removeClass('selectedItem');
      });

      // ROW SELECTOR on click only determine if checked or not and fire event
      $('.rowSelector').on('click', function(evt){
        var $this = $(this);
        evt.stopPropagation();
        evt.preventDefault();
        if($this.data('checked')) {
          $this.trigger('uncheck');
          // Notify MASS CHECKER
          $('.massChecker').trigger('itemchanged');
        }else{
          $this.trigger('check');
        }
        $this.blur();
      });
    })();

    $('.modal#scriptUpload div#scriptTemplateDescription').hide();

    $(".modal").on("click","[data-hook=advanced-section-toggler]", function(event){
      event.preventDefault(); event.stopPropagation();
      $(".modal section[data-hook=advanced]").slideToggle();
      $("i", this).toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
    });


    //
    // START SCRAPER
    //
    // ATTACH SCRAPER MODAL & FORM TO THE PAGE ELEMENTS
    //
    var scraperCRUD = new ScraperModal.TaskCRUD();
    $('[data-hook=create-scraper-task]').on('click',function(event){
      event.preventDefault(); event.stopPropagation();
      scraperCRUD.create();
    });
    $('[data-hook=edit-scraper-task]').on('click',function(event){
      event.preventDefault(); event.stopPropagation();
      var id = $( event.currentTarget ).data('task');
      scraperCRUD.edit(id);
    });
    //
    // END SCRAPER
    //
  }
});
