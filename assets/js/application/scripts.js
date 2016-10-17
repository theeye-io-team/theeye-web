/* global Dropzone, ace, bootbox, $searchbox */
Dropzone.autoDiscover = false;

$(function() {
  var self = this; // dafuk? why not {}?
  window.scriptState = window.scriptState ? window.scriptState : $({});
  var $state = window.scriptState;
  //what is the advantage of storing the scriptId on
  //a pseudo class function, its value always come from [data-hook=script-id]
  //and is re-set every time a script is created/loaded for editing
  self.scriptId = null;

  //**initialize ace editor**//
  var aceEditor = ace.edit("ace-editor");
  aceEditor.setTheme("ace/theme/twilight");
  aceEditor.session.setMode("ace/mode/javascript");

  var ext = "js";

  var $filenameInput = $("input[name=filename]");

  function extension2mode(extension) {
    //remove initial dot (.) if any
    if(extension.indexOf('.') == 0) {
      extension = extension.substr(1);
    }
    var mode = "";
    switch(extension) {
      case "ps1": mode = "powershell"; break;
      case "js": mode = "javascript"; break;
      case "bat": mode = "batchfile"; break;
      case "sh": mode = "sh"; break;
      case "py": mode = "python"; break;
      case "php": mode = "php"; break;
    }
    return mode;
  }
  function mode2extension(mode) {
    var extension = "";
    switch(mode) {
      case "powershell": extension = "ps1"; break;
      case "javascript": extension = "js"; break;
      case "batchfile": extension = "bat"; break;
      case "sh": extension = "sh"; break;
      case "python": extension = "py"; break;
      case "php": extension = "php"; break;
    }
    return extension;
  }

  //**initialize dropzone**//
  var scriptDropZone = new Dropzone(".dropzone", {
    url: "/script",
    paramName: "script",
    maxFiles: 1,
    addRemoveLinks: true,
    uploadMultiple: false,
    autoProcessQueue: false
  });

  scriptDropZone.on("sending", function(file, xhr, formData) {
    formData.append("filename", $("input#filename").val());
    formData.append("description", $("form[data-hook=script-form] textarea#description").val());
    formData.append("uploadMethod", $('input:radio[name=live-edit]:checked').val());
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

  $filenameInput.on('input', function(event){
    $('#filenamePreview').text( ($filenameInput.val() || "[auto]") + "." + ext);
  });

  //**live-editor / file-upload toogle**//
  $("[data-hook=live-edit]").click(function(e) {
    var uploadMethod = $('input:radio[name=live-edit]:checked').val();
    $("div.option").addClass('hidden-container');
    $("div[data-hook="+uploadMethod+"-container]").removeClass('hidden-container');
    switch(uploadMethod) {
      case "editor":
        $("div[data-hook=editor-mode-container]").removeClass('hidden-container');
        break;
      case "gist":
        $("div[data-hook=editor-container]").removeClass('hidden-container');
        break;
    }
  });

  //**live-editor mode setter**//
  $("[data-hook=editor-mode]").change(function() {
    var mode = $("[data-hook=editor-mode]").val();
    aceEditor.session.setMode("ace/mode/"+mode);
    ext = mode2extension(mode);
    $('#filenamePreview').text( ($filenameInput.val() || "[auto]") + "." +ext);
  });

  //**Delete script**//
  $state.on("script_deleted", function(ev,$el) {
    //$el.remove();
    location.reload();
  });

  $state.on("script_delete_error", function(ev, resp, err) {
    bootbox.alert(resp);
  });

  $(".deleteScript").on("click",function(ev) {
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
  $('.createScript').on('click',function(e) {
    // the .createScript is updated to .editScript, but the
    // listener remains. So, when the button toggles to .editScript
    // it is also provided with a data('script-id').
    // If data('script-id') exits, cancel the "createScript" routine
    if($(this).data('script-id')) {
      return;
    }
    var $scriptModal = $("#script-modal");
    self.scriptId = null; // ????????????
    scriptDropZone.options.method = 'POST';
    scriptDropZone.removeAllFiles();

    ext = "js";
    $('#filenamePreview').text("[auto]." + ext);

    $("[data-hook=script-id]",$scriptModal).val('');
    $("[data-hook=editor-mode]",$scriptModal).val('javascript');
    $("form[data-hook=script-form] textarea#description",$scriptModal).val("");
    $("input#filename",$scriptModal).val("");
    $("input[data-hook=public]",$scriptModal).removeAttr('checked');
    $("input[data-hook=public][value=false]",$scriptModal)[0].checked = true;

    aceEditor.getSession().setValue("");
    aceEditor.session.setMode("ace/mode/javascript");

    $("#script-modal").modal();
  });

  //**Script edit modal show and load**//
  $(document).on('click', '.editScript',function(e) {
    e.preventDefault();
    e.stopPropagation();
    var $form = $('form[data-hook=script-form]');
    var id = $(e.currentTarget).data('script-id');

    //set the dropzone url for script edition
    scriptDropZone.options.method = 'PUT';
    scriptDropZone.options.url = '/script/' + id;
    //set the hidden input with the current id
    $("[data-hook=script-id]", $form).val(id);


    $.ajax({
      url:'/script/' + id,
      type:'GET'
    })
    .done(function(data) {
      var script = data.script;
      var file   = data.file;
      var isPublic = script.public;
      var filename = script.filename;
      var seemsToHaveExtension = !!~filename.lastIndexOf('.');

      if(seemsToHaveExtension && !script.extension) {
        ext = filename.substr(filename.lastIndexOf('.'));
        filename = filename.substr(0,filename.lastIndexOf('.'));
      }else if(seemsToHaveExtension && script.extension){
        ext = script.extension;
        filename = filename.substr(0,filename.lastIndexOf('.'));
      }else{
        //defaults when fails to get info
        ext = "js";
      }

      $("textarea#description", $form).val(script.description);
      $("input#filename", $form).val(filename);

      $('input[data-hook=public]', $form).removeAttr('checked');
      if(isPublic) {
        $("input[data-hook=public][value=true]", $form)[0].checked = true;
      }else{
        $("input[data-hook=public][value=false]", $form)[0].checked = true;
      }


      $('#filenamePreview').text(filename + "." + ext);

      // dejo esto aca porque podria servir eventualmente
      // var modelist = ace.require("ace/ext/modelist")
      // var filePath = "blahblah/weee/some.js"
      // var mode = modelist.getModeForPath(filePath).mode
      // editor.session.setMode(mode)

      var mode = extension2mode(ext);
      $("[data-hook=editor-mode]").val(mode);

      aceEditor.session.setMode("ace/mode/" + mode);
      // delay de content for when modal is visible
      $('#script-modal').one('shown.bs.modal', function(){
        aceEditor.getSession().setValue(file || "");
      });
      // var newSession = ace.createEditSession(file || "", "ace/mode/"+mode);
      // aceEditor.setSession(newSession);
      $("#script-modal").modal();
    })
    .fail(function(error){
    });
  });

  //**Script form submit**//
  $('[data-hook=submit-form]').click(function(e) {
    var filename = $("input#filename").val();
    var isPublic = $('input[data-hook=public]:checked').val();

    var regex = new RegExp(/ *[\\~#%&*{}/:<>?/;/ |-]+ */);
    if(regex.test(filename)) {
      bootbox.alert("Invalid file filename!");
      return;
    }

    var source = aceEditor.getSession().getValue();
    if(!source.trim()) {
      bootbox.alert("Script should not be empty!");
      return;
    }
    var extension = ext;

    self.scriptId = $("[data-hook=script-id]").val();

    var url  = '/script';
    var type = 'POST';
    if(self.scriptId) {
      url  = '/script/' + self.scriptId;
      type = 'PUT';
    }

    var uploadMethod = $('input:radio[name=live-edit]:checked').val();
    if(uploadMethod === 'fileupload') {
      scriptDropZone.processQueue();
    } else {
      if(!/^#!\/.*/.test(source) && 1 == 2) { //remove this part, makes no sense
        bootbox.confirm('No interpreter found, want to continue?',function(confirmed) {
          if(confirmed) {
            var formData = new FormData();
            formData.append("filename", $("input#filename").val());
            formData.append("description", $("form[data-hook=script-form] textarea#description").val());
            formData.append("uploadMethod", $('input:radio[name=live-edit]:checked').val());
            formData.append('scriptSource', btoa(source));
            formData.append('extension', extension);
            formData.append('public', isPublic);
            $.ajax({
              url: url,
              type: type,
              data: formData,
              processData: false,
              contentType: false,
              dataType: 'json'
            })
            .done(function(data) {
              $state.trigger('script_uploaded', data);
            })
            .fail(function(error) {
              alert("Error processing the script!", "Scripts");
            });
          } else {
            return;
          }
        });
      } else {
        var formData = new FormData();
        formData.append("filename", filename + "." + extension);
        formData.append("description", $("form[data-hook=script-form] textarea#description").val());
        formData.append("uploadMethod", $('input:radio[name=live-edit]:checked').val());
        formData.append('scriptSource', btoa(source));
        formData.append('extension', extension);
        formData.append('public', isPublic);
        $.ajax({
          url: url,
          type: type,
          data: formData,
          processData: false,
          contentType: false,
          dataType: 'json'
        })
        .done(function(data) {
          $state.trigger('script_uploaded', data);
        })
        .fail(function(error) {
          alert("Error processing the script!", "Scripts");
        });
      }
    }
  });

  //**Handle script upload success**//
  $state.on('script_uploaded', function(ev, data) {
    if(location.pathname != '/admin/script') {
      return;
    } else {
      alert("Script succesfully uploaded", "Script upload", function() {
        if(self.scriptId) {
          $('#script-modal').modal('hide');
          $('span.name','div.itemRow[data-item-id='+data.script.id+']').text(data.script.filename);
        } else {
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
    });
  });

  // GIST LOADER INPUT + BUTTON BEHAVIOR
  (function(){

    var $gistInput = $('input#gist-url');
    var $downloadButton = $('input#gist-url').parent().find('button');
    var $downloadButtonIcon = $downloadButton.children('span').first();
    // var $fileNameField = $('input[name=filename]');
    var $descriptionField = $('textarea[name=description]');

    var failAlert = function(msg){
      $downloadButtonIcon.addClass('glyphicon-remove');
      msg = msg || 'Please, paste a public gist id ' +
        'or URL (aka: single gist ID string or a URL '+
        'starting with "https://gist.github.com")';
      alert(msg);
    };
    $downloadButton.on('click', function(evt){
      var urlish = $gistInput.val();
      //if we are working or no value on input, ignore
      if($downloadButton.data('loading') || !urlish) {
        return;
      }

      var gistId = "";

      if(urlish.split('/').length === 1) {
        //this is a simple gist id (single string)
        gistId = urlish;
      }else{
        //we'll treat this case as a url
        if(/https:\/\/gist\.github\.com/.test(urlish) !== true) {
          //not a gist.github gist
          failAlert();
          return;
        }
        //assume gist url is correct, assign to element
        var mockElement = document.createElement('a');
        mockElement.href = urlish;

        //get pathname of the a.href, split on / and take 3rd item
        // eg: "/username/r8j4398rj938".split('/') = ["","username","r8j4398rj938"]
        gistId = mockElement.pathname.split('/')[2];
      }

      if(!gistId) {
        //if everything fail to get a gistId, return
        failAlert();
        return;
      }

      // LOAD GIST:
      $downloadButtonIcon
        .removeClass('glyphicon-download')
        .addClass('glyphicon-ban-circle')
        .data('loading', true);
      $.getJSON("https://api.github.com/gists/"+gistId, function(){
      })
      .fail(function(xhr, status, error){
        $downloadButtonIcon
          .addClass('glyphicon-remove');
      })
      .success(function(res, status, xhr){

        var files = Object.keys(res.files);
        if(!files.length) {
          failAlert("Loaded the gist, but couldn't find any files in it");
          return;
        }

        //right now, we only accept a single (first) file
        var file = res.files[files[0]];

        var source = file.content.replace(/^#!\/.*\n/,'');

        //set name is none set
        if(!$('input[name=filename]').val()) {
          $('input[name=filename]').val(files[0]);
        }
        var modelist = ace.require('ace/ext/modelist');
        var mode = modelist.getModeForPath(file.filename).mode;
        aceEditor.session.setMode(mode);
        switch(file.language) {
          case "Shell": //horribly, gist calls .sh like this
            // aceEditor.session.setMode("ace/mode/sh");
            aceEditor.getSession().setValue('#!/usr/bin/env bash \n' + source);
            break;
          case "JavaScript":
            // aceEditor.session.setMode("ace/mode/javascript");
            aceEditor.getSession().setValue('#!/usr/bin/env nodejs \n' + source);
            break;
          default:
            aceEditor.getSession().setValue(source);
            // failAlert('Sadly, we are only accepting JavaScript (.js) and Shell (.sh) gists. Sorry. Please try another');
        }
        if(!$descriptionField.val()) {
          $descriptionField.val(res.description);
        }

        $downloadButtonIcon
          .addClass('glyphicon-ok');
      })
      .always(function(res, status, xhr){
        $downloadButtonIcon
          .removeClass('glyphicon-ban-circle')
          .data('loading', false);
      });
    });

    //reset button to download state on input change
    $gistInput.on('input', function(evt){
      $downloadButtonIcon
        .removeClass('glyphicon-ok')
        .removeClass('glyphicon-ban-circle')
        .removeClass('glyphicon-remove')
        .removeClass('glyphicon-download');
      if(!$gistInput.val()) {
        $downloadButtonIcon.addClass('glyphicon-remove');
      }else{
        $downloadButtonIcon.addClass('glyphicon-download');
      }
    });
  })();

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

            $.when.apply($, deleteRequests)
            .then(function(){ }, function(){ }, function() { })
            .progress(function(){ })
            .always(function(){ $.unblockUI(); })
            .done(function(){ });
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

});
