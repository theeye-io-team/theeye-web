
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
      $('.itemRow.selectedItem:visible').each(function(i,e){
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
            var removeOnSuccess = function(response, status, xhr) {
              console.log('request success');
              console.log(arguments);
              // horrible kludge:
              // response is "Task TASK_ID deleted"
              // split by " " and take 2nd result as taskId
              // API should respond with only id or {taskId: ID}
              if(status === "success") {
                $('div.itemRow[data-item-id='+response.split(" ")[1]+']').remove();
              }
            };
            for(var ii = 0; ii < taskIds.length; ii++) {
              deleteRequests.push(
                $.ajax({
                  url: apiUrlEndpoint + taskIds[ii],
                  type: apiRequestType,
                  // on success remove div[data-item-id=itemId]
                  success: removeOnSuccess
                })
              );
            }

            $.when.apply($, deleteRequests).then(
              function(){
                console.log('then success');
                console.log(arguments);
                alert(taskRows + successFooter, successTitle);
              },function(){
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
