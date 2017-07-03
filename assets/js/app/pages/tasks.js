/* global Select2Data, Tags, FormElement, bootbox, humanInterval, lodash, $searchbox, ScraperModal */
var TasksPageInit = (function(){

  window.scriptState = window.scriptState ? window.scriptState : $({});

  var fetchSuccess = lodash.after(2,initialize);

  new HelpIcon({
    color:[255,255,255],
    category:'title_help',
    text: HelpTexts.titles.task_page
  })
    .$el
    .appendTo(
      $('.table-header.admin span.title i[data-hook=help]')
    );

  var _users = new App.Collections.Users();
  _users.fetch({
    data:{ where:{
      $and:[
        {credential: { $ne:'agent' }},
        {credential: { $ne:'viewer' }},
      ]
    } },
    success:fetchSuccess,
    failure:failure
  });
  //window.users = _users;

  var _tasks = new App.Collections.Tasks();
  _tasks.fetch({
    data:{ populate:'host' },
    success:fetchSuccess,
    failure:failure
  });
  //window.tasks = _tasks;

  function failure () {
    bootbox.alert('an error has ocurred.');
  }

  /**
   *
   * initialize the page after data fetch done
   *
   */
  function initialize () {
    $('#script-modal').on('hidden.bs.modal', function(){
      $('body').addClass('modal-open');
    });

    (function copyButton (){
      $('button[data-hook=copy]').on('click',function(event){
        event.preventDefault();
        event.stopPropagation();

        var id = $(this).data('task');
        var task = _tasks.get(id);

        var modal = new Modal({ 'title': 'Copy task ' + task.get('name') });
        modal.render();

        var hosts = new Backbone.Collection(window.Hosts);
        hosts.remove( task.get('host_id') );
        var view = new HostsSelect({ collection: hosts });

        modal.content = view;
        modal.$el.on('hidden.bs.modal',function(){
          view.remove();
          modal.remove();
        });

        modal
          .find('button[data-hook=save]')
          .on('click',function(event){
            var hosts = view.values;

            hosts.forEach(function(id){
              task.createClone({ hosts: [id] },{
                success:function(model, response, options){
                  bootbox.alert('task created',function(){
                    window.location.reload();
                  });
                },
                error:function(model, response, options){
                  bootbox.alert(JSON.stringify(response));
                }
              });
            });
          });

        modal.show();
      });
    })();

    (function update (el){
      var $taskForm = $(el);

      $taskForm.find('select[name=host_id]').select2({
        tabindex: 0,
        placeholder: 'Choose a host' });
      $taskForm.find('select[name=script_id]')
        .select2({
        tabindex: 0,
          allowClear:true, placeholder: 'Choose a script' })
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
      $taskForm.find('select[name=tags]').select2({
        tabindex: 0,
        placeholder: 'Choose tags', data: Select2Data.PrepareTags(Tags), tags: true });
      $taskForm.find('select[name=triggers]').select2({
        tabindex: 0,
        placeholder: 'Events', data: Select2Data.PrepareEvents( window.Events ) });

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

        var id = $taskForm.data('task-id');
        var vals = (new FormElement($taskForm)).get();
        vals.type = 'script';

        // parse arguments
        vals.script_arguments = vals.script_arguments
          .split(',')
          .map(function(str){
            return str.trim();
          });

        TaskActions.update(id,vals);

        return false; // stopPropagation from within the flow
      });
    })("form#editTaskForm");

    (function create(el){
      var $taskForm = $(el);
      var $multihostContainer = $taskForm.find('.hidden-container.multiple-hosts-selection');

      $taskForm.find('select[name=hosts_id]').select2({
        tabindex: 0,
        placeholder: 'Type a hostname or hit Enter to list' });
      $taskForm.find('select[name=script_id]')
        .select2({
        tabindex: 0,
          allowClear:true, placeholder: 'Choose a script' })
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
      $taskForm.find('select[name=tags]').select2({
        tabindex: 0,
        placeholder:'Tags', tags:true, data: Select2Data.PrepareTags(Tags) });
      $taskForm.find('select[name=triggers]').select2({
        tabindex: 0,
        placeholder: 'Events', data: Select2Data.PrepareEvents( window.Events ) });

      var usersSelect = new UsersSelect({ collection: _users });
      usersSelect.render();

      var taskSelect = new TaskSelect({
        collection: _tasks.filter(function(t){
          return t.get('type') == 'script';
        })
      });
      taskSelect.render();
      taskSelect.on('change',function(id){
        form = new FormElement($taskForm);
        if (!id) {
          form.reset();
        } else {
          var task = _tasks.get(id);
          form.set(task.attributes);
        }
      });


      $taskForm.prepend( taskSelect.$el );
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

      window.scriptState.on('script_uploaded', function(ev, script) {
        alert('Script succesfully uploaded','Script upload', function() {
          var $scriptIdSelect = $('select[data-hook=script_id]');
          //remove previous script option
          $('option[value='+script.id+']').remove();
          $scriptIdSelect.append('<option value="'+script.id+'">'+script.filename+'</option>');
          $scriptIdSelect.val(script.id);
          $scriptIdSelect.trigger('change');
          $('.modal#script-modal').modal('hide');
        });
      });

      $taskForm.on('submit', function(event) {
        event.preventDefault();

        var vals = (new FormElement($taskForm)).get();
        vals.type = 'script';

        // parse arguments
        vals.script_arguments = vals.script_arguments
          .split(',')
          .map(function(str){
            return str.trim();
          });
        vals.hosts = vals.hosts_id;

        TaskActions.create(vals);

        return false; // stopPropagation from within the flow
      });
    })('form#createTaskForm');

    (function remove(){
      $('.deleteTask').on('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var itemRow = $(this).closest('.itemRow');

        bootbox.confirm('The task will be removed. Want to continue?',
          function(confirmed) {
            if(!confirmed) return;
            TaskActions.remove(itemRow.data().itemId);
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
      var $calendarElement, eventSources;
      var $scheduleItemElement = $('.scheduleItem').first().clone().removeClass('hidden');
      var kindlyApologyze = 'Ooops, something went wrong. Sorry ¯\\_(ツ)_/¯ ' +
        'Would you care to refresh the page?';

      // starts the deletion process by showing a delete-confirmation-modal
      function showDeleteModal(eventObject) {
        var schedule = eventObject.source.scheduleData;
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
        $('.startsOn', $deleteModal).text(new Date(schedule.data.scheduleData.runDate));
        $('.repeatEvery', $deleteModal).text(schedule.data.scheduleData.repeatEvery || "Never");

        // this two are hidden till we figure out how last/next Run is really set
        $('.lastRun', $deleteModal).text(schedule.lastRunAt);
        $('.nextRun', $deleteModal).text(schedule.nextRunAt);

        $scheduleDeleter.data('schedule', eventObject);
      }

      function updateAttention($itemRow, numSchedules) {
        // if numSchedules is specified, don't search the DOM for hasSchedule
        var hasSchedule = numSchedules !== undefined
          ? Boolean(numSchedules)
          : $('.scheduleItem', $itemRow).length > 0;

        if(hasSchedule) {
          $('.scheduleTask > span', $itemRow).toggleClass('attention', true);
        }else{
          $('.scheduleTask > span', $itemRow).toggleClass('attention', false);
        }
      }
      // show.bs.collapse, load schedules on collapse show
      $('.itemRow > .collapse').each(function(i,e){
        $(e).on('show.bs.collapse', function(event){
          // this is the div.collapse
          var $itemRow = $(this).closest('.itemRow');
          // get the scheduleList and clean it
          var $scheduleList = $('.schedule-list', this).html('');

          var itemData = $itemRow.data();
          //esto tiene que apuntar a /task/:id/schedule
          $.get("/task/" + itemData.itemId + "/schedule").done(function(data){
            // only if we have some data
            if(data.scheduleData.length > 0) {
              data.scheduleData.forEach(function(schedule){
                // get the scheduleItem template
                var $scheduleItem = $scheduleItemElement.clone();
                var nextDate = schedule.nextRunAt ? new Date(schedule.nextRunAt).toString() : 'false';
                $('.startDate > span', $scheduleItem).text(schedule.data.scheduleData.runDate);
                $('.nextDate > span', $scheduleItem).text(nextDate || '-');
                $('.repeatsEvery > span', $scheduleItem).text(schedule.repeatInterval || '-');
                $('button.deleteSchedule', $scheduleItem).click(function(evt){
                  evt.preventDefault();
                  evt.preventDefault();

                  //confirm and request DELETE
                  bootbox.confirm('The schedule will be canceled. Want to continue?',
                    function(confirmed) {
                      if(!confirmed) return;
                      $scheduleItem.addClass('hidden');
                      $.ajax({
                        url: '/task/' + schedule.data.task_id +
                        '/schedule/' + schedule._id,
                        type: 'DELETE'
                      }).done(function(data) {
                        $deleteModal.modal('hide');
                        $scheduleItem.remove();
                        updateAttention($itemRow);
                      }).fail(function(xhr, err, xhrStatus) {
                        $scheduleItem.removeClass('hidden');
                        alert(kindlyApologyze);
                      });
                    }
                  );
                });
                $scheduleList.append($scheduleItem);
              });
            }
          }).fail(function(xhr, err, xhrStatus) {
            alert(kindlyApologyze);
          });
        });
      });

      function buildEventSeries(title, scheduleDate, interval, rangeStart, rangeEnd) {
        var events = [];
        interval = interval ? humanInterval(interval) : false;
        var start;
        if (scheduleDate < rangeStart) {
          // get offset from 0 hours of sunday (first day of week on fullcalendar)
          var offset =
            scheduleDate.getDay() * 24 * 60 * 60 * 1000
            + (scheduleDate.getHours() * 60 * 60 * 1000)
            + (scheduleDate.getMinutes() * 60 * 1000);
          start = rangeStart.valueOf() + offset;
        } else {
          start = scheduleDate.valueOf();
        }

        var end = rangeEnd.valueOf();
        if(interval) {
          for(var ii = start; ii <= end; ii += interval) {
            events.push({
              'title': title,
              start: new Date(ii)
            });
          }
        }else{
          // only if within range
          if(scheduleDate > rangeStart && scheduleDate < rangeEnd) {
            events.push({
              'title': title,
              start: new Date(scheduleDate)
            });
          }
        }
        return events;
      }

      function getEventSources(scheduleArray, name, rangeStart, rangeEnd) {

        return lodash.map(scheduleArray, function(schedule, index, arr){
          // 200 is the offset of the color wheel where 0 is red, change at will.
          // 180 is how wide will the angle be to get colors from,
          // lower (narrower) angle will get you a more subtle palette.
          // Tone values are evenly sparsed based on array.length.
          // Check this: http://www.workwithcolor.com/hsl-color-picker-01.htm
          var wheelDegree = 200 + 180 / arr.length * ++index;
          return {
            id: schedule._id,
            backgroundColor: 'hsl('+wheelDegree+', 80%, 48%)',
            textColor: 'white',
            className: ["calendarEvent"],
            scheduleData: schedule,
            events: buildEventSeries(
              schedule.data.name,
              // some magic is fuzzing with the returned date from api
              new Date(schedule.data.scheduleData.runDate),
              schedule.data.scheduleData.repeatEvery,
              rangeStart,
              rangeEnd
            )
          };
        });
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
        // close any collapsible, for the sake of it
        $('.itemRow > .collapse.in').collapse('hide');
        evt.preventDefault();
        evt.stopPropagation();

        eventSources = [];
        var itemData = $(this).closest('.itemRow').data();
        //esto tiene que apuntar a /task/:id/schedule
        $.get("/task/" + itemData.itemId + "/schedule").done(function(data){
          // eventSources = getEventSources(data.scheduleData, itemData.itemName);
          //prepare form
          $form.data('task-id',itemData.itemId);
          //prepare modal
          $('h4.modal-title', $mainModal).text('Schedule task: ' + itemData.itemName);
          $('input[name=datetime]').val('');
          $('input[name=frequency]').val('');

          // store data on $mainModal.data('schedule')
          $mainModal.data('schedule', data);
          // store task data as well
          $mainModal.data('task', itemData);
          //calendar stuff on event handler below
          $mainModal.modal('show');

        }).fail(function(xhr, err, xhrStatus) {
          alert(kindlyApologyze);
        });
        return;
      });

      function onCalendarViewRender () {
        var schedule = $mainModal.data('schedule');
        var itemData = $mainModal.data('task');
        $calendarElement.fullCalendar('removeEventSources');
        // TODO:
        // re calculate eventSeries here within dates:
        // $calendarElement.data('fullCalendar').getView().start|end.toString();
        var view = $calendarElement.data('fullCalendar').getView();
        eventSources = getEventSources(schedule.scheduleData, itemData.itemName, view.start, view.end);
        eventSources.forEach(function(item){
          $calendarElement.fullCalendar('addEventSource', item);
        });
      }

      //initialize calendar only once
      $mainModal.on('shown.bs.modal', function(event) {
        // console.log(schedule);
        // initialize empty fullCalendar
        if(!$calendarElement) {
          $calendarElement = $('.taskScheduleCalendar', $mainModal);
          $calendarElement.fullCalendar({
            header: {
              left: 'prev,next today',
              center: 'title',
              right: 'month,basicWeek,basicDay'
            },
            eventLimit: 5,
            eventClick: showDeleteModal,
            viewRender: onCalendarViewRender
          });

        }else{
          // when calendar was already here it doesn't trigger
          // viewRender just because modal is shown, force it
          $calendarElement.data('fullCalendar').trigger('viewRender');
        }
      });
      $mainModal.on('hide.bs.modal', function(event) {
        $calendarElement.fullCalendar('removeEventSources');
        eventSources = [];
      });

      $submitter.click(function(evt){
        var datetime = $('input[name=datetime]',$form).datetimepicker('getValue');
        var frequency = $('input[name=frequency]', $form).val();
        var taskId = $form.data('task-id');
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
            // force attention update on corresponding itemRow
            updateAttention($('.itemRow[data-item-id=' + taskId + ']'), true);
          });
        }).fail(function(xhr, status, message) {
          alert(kindlyApologyze);
        });
      });

      $scheduleDeleter.click(function(evt){
        evt.preventDefault();

        var eventData = $(this).data('schedule');
        if(!eventData.source.id) {
          alert(kindlyApologyze);
          return;
        }
        //confirm and request DELETE
        bootbox.confirm('The schedule will be canceled. Want to continue?',
          function(confirmed) {
            if(!confirmed) return;
            var taskId = eventData.source.scheduleData.data.task_id;
            $.ajax({
              url: '/task/' + taskId +
              '/schedule/' + eventData.source.scheduleData._id,
              type: 'DELETE'
            }).done(function(data) {
              $deleteModal.modal('hide');
              $calendarElement.fullCalendar('removeEventSource', eventData.source);
              updateAttention(
                $('.itemRow[data-item-id=' + taskId + ']'),
                $calendarElement.data().fullCalendar.clientEvents().length
              );
            }).fail(function(xhr, err, xhrStatus) {
              alert(kindlyApologyze);
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

              // que es esto chris?
              // deleteRequests es un array de jqXHR:
              // http://api.jquery.com/jQuery.ajax/#jqXHR
              // que devuelven una suerte de deferred/promise.
              // Cuando todos resuelven se ejecuta .then(success, fail)
              // Es similar a lodash.after -- cg
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
    var scraperCRUD = new ScraperModal.TaskCRUD({
      tasks: _tasks,
      users: _users,
    });

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

  (function initFormsHelp(){
		// edit form
    $editForm = $("form#editTaskForm");
    $editForm.find('label[for=name]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.task.name }).$el );
		$editForm.find('label[for=host]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.host }).$el );
		$editForm.find('label[for=script_select]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.scripts }).$el );
		$editForm.find('label[for=tags]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.tags }).$el );
		$editForm.find('label[for=description]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.description }).$el );
		//$editForm.find('label[for=public]').append( new HelpIcon({ category:'task_edit_form', text: '' }).$el );
		$editForm.find('label[for=script_runas]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.script_runas }).$el );
		$editForm.find('label[for=script_arguments]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.script_arguments }).$el );
		$editForm.find('label[for=triggers]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.triggers }).$el );
		$editForm.find('label[for=grace_time]').append( new HelpIcon({ category:'task_edit_form', text: HelpTexts.grace_time }).$el );

		// create form
		$createForm = $('form#createTaskForm');
    $createForm.find('label[for=name]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.task.name }).$el );
		$createForm.find('label[for=host]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.host }).$el );
		$createForm.find('label[for=script_select]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.scripts }).$el );
		$createForm.find('label[for=tags]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.tags }).$el );
		$createForm.find('label[for=description]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.description }).$el );
		//$createForm.find('label[for=public]').append( new HelpIcon({ category:'task_create_form', text: '' }) );
		$createForm.find('label[for=script_runas]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.script_runas }).$el );
		$createForm.find('label[for=script_arguments]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.script_arguments }).$el );
		$createForm.find('label[for=triggers]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.triggers }).$el );
		$createForm.find('label[for=grace_time]').append( new HelpIcon({ category:'task_create_form', text: HelpTexts.grace_time }).$el );
	})();
});
