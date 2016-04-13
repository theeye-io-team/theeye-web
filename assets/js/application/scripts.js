Dropzone.autoDiscover = false;

$(function() {
  var self      = this;
  var $state    = $({});
  self.scriptId = null;

  //**initialize ace editor**//
  var aceEditor = ace.edit("ace-editor");
  aceEditor.setTheme("ace/theme/twilight");
  aceEditor.session.setMode("ace/mode/javascript");

  //**initialize dropzone**//
  var scriptDropZone = new Dropzone(".dropzone", {
      url: "/script",
      paramName: "script",
      maxFiles: 1,
      addRemoveLinks: true,
      uploadMultiple: false,
      autoProcessQueue: false
    });

  scriptDropZone.on("sending", function(file, xhr, formData)
  {
    formData.append("filename", $("input#filename").val());
    formData.append("description", $("form[data-hook=script-form] textarea#description").val());
    formData.append("uploadMehtod", $('input:radio[name=live-edit]:checked').val());
  });

  scriptDropZone.on("addedfile", function(file){
    if($("input#filename").val() === '')
      $("input#filename").val(file.name);
  });

  scriptDropZone.on("success", function(file, responseText){
    $state.trigger("script_uploaded", responseText);
  });

  scriptDropZone.on("error", errorOnUpload);

  function errorOnUpload(file, uploadError, xhr) {
    alert(uploadError);
    scriptDropZone.removeAllFiles();
  }

  //**live-editor / file-upload toogle**//
  $("[data-hook=live-edit]").click(function(e)
  {
    var uploadMehtod = $('input:radio[name=live-edit]:checked').val();
    if(uploadMehtod === 'fileupload')
    {
      $("[data-hook=dropzone-container]").removeClass('hidden-container');
      $("[data-hook=editor-container]").addClass('hidden-container');
    }
    else
    {
      $("[data-hook=dropzone-container]").addClass('hidden-container');
      $("[data-hook=editor-container]").removeClass('hidden-container');
    }
  });

  //**live-editor mode setter**//
  $("[data-hook=editor-mode]").change(function()
  {
    var mode = $("[data-hook=editor-mode]").val();
    aceEditor.session.setMode("ace/mode/"+mode);
    var source    = aceEditor.getSession().getValue();
    // source = (source === '#!/usr/bin/env nodejs \n' || source === '#!/usr/bin/env bash \n') ? '' : source;
    source = source.replace(/^#!\/.*\n/,'');

    if(source === '' || !/^#!\/.*/.test(source))
    {
      switch (mode)
      {
        case 'javascript':
          aceEditor.getSession().setValue('#!/usr/bin/env nodejs \n' + source);
        break;
        case 'sh':
          aceEditor.getSession().setValue('#!/usr/bin/env bash \n' + source);
        break;
      }
    }
  });

  //**Delete script**//
  $state.on("script_deleted", function(ev,$el)
  {
    //$el.remove();
    location.reload();
  });

  $state.on("script_delete_error", function(ev, resp, err)
  {
    bootbox.alert(resp);
  });

  $(".deleteScript").on("click",function(ev)
  {
    ev.preventDefault();
    ev.stopPropagation();

    bootbox.confirm('The resource will be removed. Want to continue?',
    function(confirmed)
    {
      if(!confirmed)
        return;

      var $delTrigger = $(ev.currentTarget);
      var idScript = $delTrigger.attr("data-script-id");

      $.ajax({
        url: '/script/' + idScript,
        type: 'DELETE'
      }).done(function(data) {
        $state.trigger("script_deleted", $delTrigger.closest('div.panel-group')[0]);
      }).fail(function(xhr, err, xhrStatus) {
        $state.trigger("script_delete_error", xhr.responseText, err);
      });
    });
  });

  //**Script create modal show**//
  $('.createScript').on('click',function(e)
  {
    self.scriptId = null;
    scriptDropZone.options.method = 'POST';
    scriptDropZone.removeAllFiles();
    aceEditor.setValue('#!/usr/bin/env nodejs \n');
    $("[data-hook=script-id]").val('');
    $("[data-hook=editor-mode]").val('javascript');
    $("form[data-hook=script-form] textarea#description").val("");
    $("input#filename").val("");
    $("#script-modal").modal();
  });

  //**Script edit modal show and load**//
  $('.editScript').on('click',function(e)
  {
    e.preventDefault();
    e.stopPropagation();
    var id = $(e.currentTarget).data('script-id');

    //set the dropzone url for script edition
    scriptDropZone.options.method = 'PUT';
    scriptDropZone.options.url = '/script/' + id;
    //set the hidden input with the current id
    $("[data-hook=script-id]").val(id);


    $.ajax({
      url:'/script/' + id,
      type:'GET'
    })
    .done(function(data)
    {
      var script = data.script;
      var file   = data.file;

      $("form[data-hook=script-form] textarea#description").val(script.description);
      $("input#filename").val(script.filename);

      if(script.extension == 'js')
        $("[data-hook=editor-mode]").val('javascript');
      if(script.extension == 'sh')
        $("[data-hook=editor-mode]").val('sh');

      var mode = $("[data-hook=editor-mode]").val();

      var newSession = ace.createEditSession(file, "ace/mode/"+mode);
      aceEditor.setSession(newSession);
      $("#script-modal").modal();
    })
    .fail(function(error){
    });
  });

  //**Script form submit**//
  $('[data-hook=submit-form]').click(function(e)
  {
    var filename = $("input#filename").val();

    var regex = new RegExp(/ *[\\~#%&*{}/:<>?/;/ |-]+ */);
    if(  regex.test(filename))
    {
      bootbox.alert("Invalid file filename!");
      return;
    }


    self.scriptId = $("[data-hook=script-id]").val();

    var url  = '/script';
    var type = 'POST';
    if(self.scriptId) {
        url  = '/script/' + self.scriptId;
        type = 'PUT';
    }

    var uploadMehtod = $('input:radio[name=live-edit]:checked').val();
    if(uploadMehtod === 'fileupload')
    {
      scriptDropZone.processQueue();
    }
    else
    {
      var extension = $("[data-hook=editor-mode]").val() === 'javascript' ? 'js' : 'sh';
      var source    = aceEditor.getSession().getValue();
      if(!/^#!\/.*/.test(source))
      {
        bootbox.confirm('No interpreter found, want to continue?',function(confirmed)
        {
              if(confirmed)
              {
                var formData = new FormData();
                formData.append("filename", $("input#filename").val());
                formData.append("description", $("form[data-hook=script-form] textarea#description").val());
                formData.append("uploadMehtod", $('input:radio[name=live-edit]:checked').val());
                formData.append('scriptSource', btoa(source));
                formData.append('extension', extension);
                $.ajax({
                  url: url,
                  type: type,
                  data: formData,
                  processData: false,
                  contentType: false,
                  dataType: 'json',
                })
                .done(function(data)
                {
                  $state.trigger('script_uploaded', data);
                })
                .fail(function(error)
                {
                  alert("Error processing the script!", "Scripts");
                });
              }
              else
              {
                  return;
              }
        });
      }
      else
      {
        var formData = new FormData();
        formData.append("filename", $("input#filename").val());
        formData.append("description", $("form[data-hook=script-form] textarea#description").val());
        formData.append("uploadMehtod", $('input:radio[name=live-edit]:checked').val());
        formData.append('scriptSource', btoa(source));
        formData.append('extension', extension);
        $.ajax({
          url: url,
          type: type,
          data: formData,
          processData: false,
          contentType: false,
          dataType: 'json',
        })
        .done(function(data)
        {
          $state.trigger('script_uploaded', data);
        })
        .fail(function(error)
        {
          alert("Error processing the script!", "Scripts");
        });
      }
    }
  });

  //**Handle script upload success**//
  $state.on('script_uploaded', function(ev, data)
  {

    if(location.pathname != '/admin/script')
    {
      alert("Script succesfully uploaded","Script upload", function()
      {
        $('[data-hook=script_id]').each(function(index, element){
          $(element).append($('<option>',
          {
            value: data.script.id,
            text: data.script.filename
          }));
          $(element).val(data.script.id);
        });

        $('#script-modal').modal('hide');
      });
    }
    else
    {
      alert("Script succesfully uploaded", "Script upload", function()
      {
        if(self.scriptId)
        {
          $('#script-modal').modal('hide');
          $('[data-hook=scriptTitle'+data.script.id+']').html(data.script.filename);
        }
        else
        {
            location.reload();
        }
      });
    }
  });

//**Public script upload**//
  $('.example-code').click(function(e) {
    var mode = $("[data-hook=editor-mode]").val();
    var url = "";
    if(mode === 'javascript')
      url = 'https://raw.githubusercontent.com/JuanMsanchez/scripts/master/example-node.js';
    if(mode === 'sh')
      url = 'https://raw.githubusercontent.com/JuanMsanchez/scripts/master/example-bash.sh';

    $.ajax({
      url: '/admin/script/download',
      type: 'POST',
      dataType: 'json',
      data: {url : url}
    }).done(function(data)
    {
      aceEditor.setValue(data);
    }).fail(function(xhr, err, xhrStatus)
    {
      console.log(err);
    });
  });

  /* ROW SELECTOR + MASS CHECKER + MASS DELETE */
  (function(){

    // cancel everything if we are not on /script url
    // this script is loaded on /monitor and /task, those
    // urls have their own implementation for this
    if(!/script/.test(window.location.pathname))
      return;

    // searchbox hook
    $searchbox.on('search:start', function() {
      $('.massChecker').trigger('uncheck');
    });
    $searchbox.on('search:empty', function() {
      $('.massChecker').trigger('uncheck');
    });

    // SETUP
    var firstConfirmHeader = '<h1>Massive script delete</h1>Heads up!<br /><br />';
    var firstConfirmFooter = '<br />will be deleted.<h2>Are you sure?</h2>';
    var secondConfirmHeader = '<h1>Wait, really sure?</h1>' +
      'Please review the list, just in case:<br /><br />';
    var secondConfirmFooter = '<br />WILL BE DELETED<h2>Confirm wisely</h2>';
    var successTitle = 'Scripts deleted';
    var successFooter = '<br/>...you will be missed :(';
    var failTitle = 'Scripts deleted (some)';
    var failFooter = '<br/>...I tried to delete these scripts' +
      ' yet some of them came back with errors.' +
      '<br /><br />Please refresh now';
    var dataId = "itemId"; // the data-something where we get the id of the item
    var dataDescriptor = "itemName"; // the data-something where we get the name of the item
    var listTemplate = "{descriptor} ({id})<br />";
    var itemSelector = 'div.itemRow.selectedItem:visible';
    var apiUrlEndpoint = '/script/';
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
            ).always(function(){
                console.log('always');
                $.unblockUI();
              }
            ).done(function(){
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

});
