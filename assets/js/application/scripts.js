Dropzone.autoDiscover = false;

$(function()
{
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
    if($("input#filename").val() == '')
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
    var uploadMehtod = $('input:radio[name=live-edit]:checked').val()
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

    if(self.scriptId)
    {
        var url  = '/script/' + self.scriptId;
        var type = 'PUT';
    }
    else
    {
        var url  = '/script';
        var type = 'POST';
    }

    var uploadMehtod = $('input:radio[name=live-edit]:checked').val()
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
$('.example-code').click(function(e)
{
    var mode = $("[data-hook=editor-mode]").val();

    if(mode === 'javascript')
      var url = 'https://raw.githubusercontent.com/JuanMsanchez/scripts/master/example-node.js';
    if(mode === 'sh')
      var url = 'https://raw.githubusercontent.com/JuanMsanchez/scripts/master/example-bash.sh';

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

});
