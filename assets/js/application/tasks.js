
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
    var $singleSelect = $taskForm.find('select.host_id');

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
        if(!$singleSelect.data('select2')) $singleSelect.select2();
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
    var $multihost = $taskForm.find('.hidden-container#hosts-selection');
    var $singleresource = $taskForm.find('.hidden-container#resource-selection');
    var $singleSelect = $singleresource.find('select.hosts_id');
    var $multiSelect = $multihost.find('select.hosts_id');

    $(".modal#create-task").on('shown.bs.modal', function(event) {
      $multihost.hide();
      $taskForm.data('action','create');
      $taskForm[0].reset();

      //singleSelect is visible from the start, so when the
      //modal is shown select2 is initialized
      if(!$singleSelect.data('select2'))
        $singleSelect.select2({ placeholder: "Select a host..." });

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

  $('.modal#scriptUpload div#scriptTemplateDescription').hide();

});
