/* global bootbox, $searchbox */
/* NOTE
Lists are made up with:
  class="itemRow panel panel-default js-searchable-item"
so to treat them as items represented in a "row".
With this in mind, every button in them can reference
the item they are representing (and its data)
by calling:
$(this).closest('.itemRow')
Ex:
$('button.edit-task').on('click', function(event){
  $(this) // the button jQuerized
    .closest('.itemRow') // the row the button is in
    .data(); // returns {itemName, itemData, ...}
});
This way we can save a lot of markup such as data-id or data-whatever
usually repeated in every button
*/
$(function() {

  window.scriptState = window.scriptState ? window.scriptState : $({});
  var $state = window.scriptState;

  function extractFormData ($el) {
    return $el.find(':input')
      .toArray()
      .reduce(function(obj, input) {
        if(input.name=='hosts_id'){
          if(!obj[input.name]) obj[input.name]=[];
          obj[input.name].push(input.value);
        }
        else if(input.name=='public'){
          if(input.checked===true){
            obj[input.name] = input.value;
          }
        } else {
          obj[input.name] = input.value;
        }
        return obj;
      },{});
  }

  (function update (el){

    function fillForm($form, data){
      $form[0].reset();
      Object.keys(data)
        .forEach(function(name,index){
          var selector = '[data-hook=:name]'.replace(':name',name);
          var $el = $form.find(selector);

          if($el.length>0){
            if($el[0].type=='radio'){
              var radio = '[type=radio][data-hook=:name][value=:value]'
              .replace(':name',name)
              .replace(':value',data[name]);
              $form.find(radio).prop('checked',true);
            } else {
              $el.val(data[name]);
            }
          }
        });
    }

    var $taskForm = $(el);
    var $singleSelect = $('select.host_id', $taskForm);

    $('.editTask').on('click', function(evt){
      evt.preventDefault();
      evt.stopPropagation();
      var taskId = $(this).closest('.itemRow').data('item-id');
      $taskForm.data('task-id',taskId);
      $taskForm.data('action','edit');

      $.get("/task/" + taskId).done(function(data){
        fillForm($taskForm, data.task);

        $('#edit-task').modal('show');
        // the rest is up to the shown.bs.modal event (below)
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("task_fetch_error", xhr.responseText, err);
      });
    });

    $(".modal#edit-task").on('shown.bs.modal', function(event) {
      //nice-guy first input auto focus
      $('#name',this).focus();

      $singleSelect.select2({ placeholder: "Select a host..." });

      $('#script_id', $taskForm).select2({ placeholder: "Select a script..." });
    });

    $(".modal#edit-task button[type=submit]").on('click',function(event){
      console.log('marimba');
      $taskForm.submit();
    });

    $taskForm.on("submit", function(event) {
      event.preventDefault();
      var vals = extractFormData($taskForm);

      jQuery.ajax({
        url:"/task/" + $taskForm.data('task-id'),
        data:vals,
        type:'put'
      }).done(function(data) {
        $(".modal#edit-task").modal("hide");
        window.location.reload();
      }).fail(function(xhr, err, xhrStatus) {
        alert( xhr.responseText );
      });

      return false;
    });

    return $taskForm;
  })("form#editTaskForm");


  (function create(el){

    var $taskForm = $(el);
    var $multihost = $('.hidden-container#hosts-selection', $taskForm);
    var $multiSelect = $('select.hosts_id', $multihost);
    var $singleresource = $('.hidden-container#resource-selection', $taskForm);
    var $singleSelect = $('select.hosts_id', $singleresource);

    $(".modal#create-task").on('shown.bs.modal', function(event) {
      //nice-guy first input auto focus
      $('#name',this).focus();

      $multihost.hide();
      $taskForm.data('action','create');
      $taskForm[0].reset();

      //singleSelect is visible from the start, so when the
      //modal is shown select2 is initialized
      if(!$singleSelect.data('select2'))
        $singleSelect.select2({ placeholder: "Select a host..." });

      // initialize script_id select2
      if(!$('#script_id', $taskForm).data('select2'))
        $('#script_id', $taskForm).select2({ placeholder: "Select a script..." });

      // initialize resource_id select2
      if(!$('#resource_id', $taskForm).data('select2'))
        $('#resource_id', $taskForm).select2({ placeholder: "Select a resurce..." });

    });

    $state.on("task_created", function() {
      $(".modal#create-task").modal("hide");
      alert('task created','Task', function(){
        window.location.reload();
      });
    });

    $state.on("task_create_error", function(ev, error) {
      alert(error);
    });

    $taskForm.find("input[type=radio][name=target]").on("change", function(){
      var val = $(this).val();
      if( val == 'single-resource' ) {
        $multihost.hide(50);
        $multihost.find("option:selected").removeAttr("selected");
        $singleresource.show(50);
      } else if( val == 'multi-hosts' ){
        $singleresource.hide(50);
        $singleresource.find("select").val(0);

        //multiSelect is hidden and select2 won't work properly
        //hook select2 initialization when multiSelect is fully visible
        $multihost.show(50, function(){
          if(!$multiSelect.data('select2')) $multiSelect.select2({
            placeholder: 'Type a hostname or hit Enter to list'
          });
        });
      }
    });

    $(".modal#create-task button[type=submit]").on('click',function(event){
      $taskForm.submit();
    });

    $state.on('script_uploaded', function(ev, data) {

      if(location.pathname != '/admin/task') {
        //restrict the event function to the /admin/task layout
        return;
      }
      alert("Script succesfully uploaded","Script upload", function() {
        $('[data-hook=script_id]').each(function(index, element){
          console.log(element);
          $(element).append($('<option>', {
            value: data.script.id,
            text: data.script.filename
          }));
          $(element).val(data.script.id);
          $(element).trigger('change');
        });

        $('#script-modal').modal('hide');
      });

    });
    $taskForm.on("submit", function(event) {
      console.log('tropa');
      event.preventDefault();
      var vals = extractFormData($taskForm);
      jQuery.post("/task", vals).done(function(data) {
        $state.trigger("task_created");
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("task_create_error", xhr.responseText, err);
      });

      return false;
    });

  })("form#createTaskForm");


  (function remove(){
    $state.on("task_deleted", function(ev,data) {
      console.log(arguments);
      data.row.remove();
      // location.reload();
    });
    $state.on("task_delete_error", function(ev, resp, err) {
      alert(resp);
    });
    $(".deleteTask").on("click",function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var itemRow = $(this).closest('.itemRow');

      bootbox.confirm('The resource will be removed. Want to continue?',
        function(confirmed) {
          if(!confirmed)
            return;

          $.ajax({
            url: '/task/' + itemRow.data().itemId,
            type: 'DELETE'
          }).done(function(data) {
            $state.trigger("task_deleted", {row: itemRow});
          }).fail(function(xhr, err, xhrStatus) {
            $state.trigger("task_delete_error", xhr.responseText, err);
          });
        }
      );
    });
  })();

  (function schedule(){
    var $modal = $('#schedule-task-modal');
    var $form = $('form', $modal);
    var $submitter = $('button[type=submit]',$modal);

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
      // console.log(this);
      var itemData = $(this).closest('.itemRow').data();
      // console.log(itemData);
      //prepare form
      $form.data('task-id',itemData.itemId);
      //prepare modal
      $('h4.modal-title',$modal).text('Schedule task: ' + itemData.itemName);
      $('input[name=datetime]').val('');
      $modal.modal('show');
      return;
    });

    $submitter.click(function(evt){
      var datetime = $('input[name=datetime]',$form).datetimepicker('getValue');
      //SCHEDULE!!!
      $.post("/palanca/schedule", {
        task_id: $form.data('task-id'),
        scheduleData: {
          // repeatsEvery: '24 hours',
          runDate: datetime
        }
      }).done(function(data,status,xhr){
        alert("All right! Your task will run on: " + data.nextRun, function(){
          $modal.modal('hide');
        });
        // console.log(data);
      }).fail(function(xhr, status, message) {
        console.log('fail');
        // console.log(arguments);
      });
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
              var t = taskIds[ii];
              deleteRequests.push(
                $.ajax({
                  url: apiUrlEndpoint + t,
                  type: apiRequestType,
                  // on success remove div[data-item-id=itemId]
                  success: (function(aa){
                    return removeOnSuccess(aa);
                  })(t)
                })
              );
            }

            $.when.apply($, deleteRequests).then(
              function(){
                console.log('then success');
                console.log(arguments);
                alert(taskRows + successFooter, successTitle);
              },
              function(){
                console.log('then fail');
                console.log(arguments);
                alert(taskRows + failFooter, failTitle);
              },
              // then progress nunca se llama ... ?
              function() {
                console.log('then progress');
                console.log(arguments);
              }
            // when progress nunca se llama tampoco ... ?
            ).progress(function(){
              console.log('when progress');
              console.log(arguments);
            }).always(function(){
              $.unblockUI();
            }).done(function(){
              // done deberia volver con array de results
              // no se si no funciona o es porque el req.DELETE
              // no devuelve nada, habria que probar de cambiar la API
              console.log('when done');
              console.log(arguments);
              console.log('ok, they are gone');
            });
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
      console.log('checking items state');
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

});
