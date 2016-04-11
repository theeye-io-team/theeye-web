
$(function() {

  var $state = $({});

  function extractFormData ($el) {
    return $el.serializeArray().reduce(function(obj, input) {

      if(input.name=='hosts_id'){
        if(!obj[input.name]) obj[input.name]=[];
        obj[input.name].push(input.value);
      }
      else obj[input.name] = input.value;
      return obj;

    }, {});
  }

  (function update (el){

    var $taskForm = $(el);

    function fillForm($viewElement, data) {
      $viewElement[0].reset();
      Object.keys(data).forEach(function(k) {
        var $el = $viewElement.find("[data-hook="+ k + "]");
        $el.val(data[k]);
      });
    }

    $(".modal#edit-task").on('shown.bs.modal', function(event) {
      event.preventDefault();
      event.stopPropagation();
      var taskId = event.relatedTarget.getAttribute('data-task-id');
      $taskForm.data('task-id',taskId);
      $taskForm.data('action','edit');
      jQuery.get("/task/" + taskId).done(function(data){
        fillForm($taskForm, data.task);
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("task_fetch_error", xhr.responseText, err);
      });
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

    $(".modal#create-task").on('shown.bs.modal', function(event) {
      $taskForm.find(".hidden-container#hosts-selection").hide();
      $taskForm.data('action','create');
      $taskForm[0].reset();
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
      var $multihost = $taskForm.find('.hidden-container#hosts-selection');
      var $singleresource = $taskForm.find('.hidden-container#resource-selection');
      if( val == 'single-resource' ) {
        $multihost.hide(50);
        $multihost.find("option:selected").removeAttr("selected");
        $singleresource.show(50);
      } else if( val == 'multi-hosts' ){
        $singleresource.hide(50);
        $singleresource.find("select").val(0);
        $multihost.show(50);
      }
    });

    $taskForm.on("submit", function(event) {
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
    $state.on("task_deleted", function(ev,$el) {
      //$el.remove();
      location.reload();
    });
    $state.on("task_delete_error", function(ev, resp, err) {
      alert(resp);
    });
    $(".deleteTask").on("click",function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      bootbox.confirm('The resource will be removed. Want to continue?',
      function(confirmed)
      {
        if(!confirmed)
          return;

        var $delTrigger = $(ev.currentTarget);
        var idTask = $delTrigger.data("task-id");

        $.ajax({
          url: '/task/' + idTask,
          type: 'DELETE'
        }).done(function(data) {
          $state.trigger("task_deleted", $delTrigger.closest('div.panel-group')[0]);
        }).fail(function(xhr, err, xhrStatus) {
          $state.trigger("task_delete_error", xhr.responseText, err);
        });
      });
    });
  })();

  // MASS DELETE
  (function massDelete(){
    // MASS DELETE - OJO
    $('.massDelete').on('click', function(evt){
      evt.preventDefault();
      var taskRows = "";
      var taskIds = [];
      //collect selected rows.data (taskId & taskName)
      $('.rowSelect:visible span.glyphicon-check').each(function(i,e){
        var taskId = $(this).parent().data('taskId');
        var taskName = $(this).parent().data('taskName');
        if(taskId) {
          taskIds.push(taskId);
          //concatenate notification rows
          taskRows = taskRows + taskName + " (" + taskId + ")<br />";
        }
      });
      if(taskRows) {
        var confirmMsgHeader = '<h1>Massive task delete</h1>Heads up!<br /><br />';
        var confirmMsgFooter = '<br />will be deleted.<h2>Are you sure?</h2>';
        bootbox.confirm(confirmMsgHeader + taskRows + confirmMsgFooter, function(result1){
          if(!result1) {
            return;
          }
          confirmMsgHeader = '<h1>Really sure?</h1>';
          confirmMsgHeader = confirmMsgHeader + 'Please review this list, just in case:<br /><br />';
          confirmMsgFooter = '<br />will be deleted.<h2>Confirm wisely</h2>';
          bootbox.confirm(confirmMsgHeader + taskRows + confirmMsgFooter, function(result2){
            if(!result2) {
              return;
            }
            $.blockUI();
            var deleteRequests = [];
            for(var ii = 0; ii < taskIds.length; ii++) {
              var t = taskIds[ii];
              deleteRequests.push(
                $.ajax({
                  url: '/task/' + t,
                  type: 'DELETE',
                  // en success remove div[data-task=taskId]
                  success: function(response,status,xhr){
                    console.log('request success');
                    console.log(arguments);
                    // horrible kludge:
                    // response is "Task TASK_ID deleted"
                    // split by " " and take 2nd result as taskId
                    // API should respond with only id or {taskId: ID}
                    if(status === "success") {
                      $('div[data-task='+response.split(" ")[1]+']').remove();
                    }
                  }
                })
              );
            }

            $.when.apply($, deleteRequests).then(
              function(){
                console.log('then success');
                console.log(arguments);
                alert(taskRows + '<br/>...you will be missed :(','Tasks deleted');
              },function(){
                console.log('then fail');
                console.log(arguments);
                var msg = '<br/>...I tried to delete these tasks';
                msg = msg + ' yet some of them came back with errors.';
                msg = msg + '<br /><br />Please refresh now';
                alert(taskRows + msg,'Tasks deleted (some)');
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
              }
            ).done(function(){
              // done deberia volver con array de results
              // no se si no funciona o es porque el req.DELETE
              // no devuelve nada, habria que probar de cambiar la API
              console.log('when done');
              console.log(arguments);
              console.log('ok, they are gone');
              $.unblockUI();
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
        //uncheck all
        $('.rowSelect').trigger('uncheck');
        $this.data('checked',false);
        $spanIcon.removeClass('glyphicon-check');
        $spanIcon.addClass('glyphicon-unchecked');
      }else{
        // do an uncheck all, there maybe some left from a prior search
        // this should be hooked on the search event
        $('.rowSelect').trigger('uncheck');
        $('.rowSelect:visible').trigger('check');
        $this.data('checked',true);
        $spanIcon.addClass('glyphicon-check');
        $spanIcon.removeClass('glyphicon-unchecked');
      }
      $(this).blur();
    });

    // MASS CHECKER: when an item changes state it triggers
    // a itemchanged event on massChecker. On itemchanged MASS CHECKER
    // checks for an unchecked item. If any, MASS CHECKER unchecks itself
    $('.massChecker').on('itemchanged', function(evt){
      console.log('checking items state');
      var $this = $(this);
      var $spanIcon = $this.children('span').first();
      $('.rowSelect:visible').each(function(i,e){
        // console.log($(e).data());
        if(!$(e).data('checked')) {
          $this.data('checked', false);
          $spanIcon.removeClass('glyphicon-check');
          $spanIcon.addClass('glyphicon-unchecked');
          return;
        }
      });
    });

    // ROW SELECTOR
    $('.rowSelect').on('check', function(evt){
      var $this = $(this);
      var $spanIcon = $this.children('span').first();
      $this.data('checked',true);
      $spanIcon.addClass('glyphicon-check');
      $spanIcon.removeClass('glyphicon-unchecked');
      $this.closest('.panel-title-content').addClass('selectedEntry');
    });
    $('.rowSelect').on('uncheck', function(evt){
      var $this = $(this);
      var $spanIcon = $this.children('span').first();
      $this.data('checked',false);
      $spanIcon.removeClass('glyphicon-check');
      $spanIcon.addClass('glyphicon-unchecked');
      $this.closest('.panel-title-content').removeClass('selectedEntry');
    });

    // ROW SELECTOR on click only determine if checked or not and fire event
    $('.rowSelect').on('click', function(evt){
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
