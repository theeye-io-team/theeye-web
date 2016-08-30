$(function(){
  /* global bootbox, CustomerTags, $searchbox, debug */
  var ResourceStates = {
    normalState: 'normal',
    failureState: 'failure',
    loadingState: 'unknown',
    unknownState: 'updates_stopped'
  };

  var log = debug('eye:web:admin:resources');

  function methodHasBody (method) {
    return method == 'POST' ||
    method == 'PUT' ||
    method == 'PATCH' ||
    method == 'OPTIONS' ||
    method == 'DELETE';
  }

  function extractFormData($el){
    var inputs = $el.find(":input");
    var values = {};
    inputs.each(function(){
      var input = this;
      if(!input.value) return;
      if(input.name=='disabled' && input.type=='checkbox'){
        values.enable = !input.checked;
      } else if(input.type=='checkbox') {
        if(input.value && input.value != 'on'){
          if(input.checked) values[input.name] = input.value;
        } else {
          values[input.name] = input.checked;
        }
      } else if(input.type=='radio') {
        if( input.checked )
          values[input.name] = input.value;
      } else {
        values[input.name] = $(input).val();
      }
    });
    return values;
  }

  /**
  *  MUTE
  */
  (function(){
    function setAlerts (resource_id,enable) {
      if(typeof enable === 'boolean'){
        jQuery.ajax({
          url: '/resource/' + resource_id + '/alerts',
          type: 'PATCH',
          data:{ 'enable': enable }
        }).done(function(data) {
          bootbox.alert('success!',function(){
            window.location.reload();
          });
        }).fail(function(xhr, err, xhrStatus) {
          bootbox.alert(err);
        });
      }
    }

    $('button.resource-disable-alerts').on('click',function(event){
      var resource_id = event.currentTarget.dataset.resource_id;
      setAlerts(resource_id,enable=false);
    });
    $('button.resource-enable-alerts').on('click',function(event){
      var resource_id = event.currentTarget.dataset.resource_id;
      setAlerts(resource_id,enable=true);
    });
  })();

  //CREATE RESOURCE FUNCTION
  (function(){
    function updateResourceMonitor($el){
      var idResource = $el.find("[data-hook=resource_id]").val();
      var values = extractFormData($el);
      $.ajax({
        url: '/resource/' + idResource,
        type: 'PUT',
        data: values
      }).done(function(data) {
        window.location.reload();
      }).fail(function(xhr, err, xhrStatus) {
        bootbox.alert(err);
      });
    }

    function createResourceMonitor($el){
      var values = extractFormData($el);
      $.ajax({
        method:'POST',
        url:'/resource/' + values.monitor_type,
        data: JSON.stringify(values),
        contentType: "application/json; charset=utf-8"
      }).done(function(data){
        window.location.reload();
      }).fail(function(xhr, err, xhrStatus){
        bootbox.alert(xhr.responseText);
      });
    }

    function formSubmit(event, type){
      event.preventDefault();
      log('submiting form type %s', type);
      log('current action %o', window.resourceActionData);

      var action = window.resourceActionData.action;
      var $form = $("form#" + type + "ResourceForm");

      if(action=='edit'){
        updateResourceMonitor($form);
      } else {
        createResourceMonitor($form);
      }
    }

    function setCallback(type){
      return function(event){
        formSubmit(event,type);
      };
    }

    $('.modal#processResourceModal button[type=submit]').on('click', setCallback('process'));
    $('.modal#scriptResourceModal button[type=submit]').on('click', setCallback('script'));
    $('.modal#scraperResourceModal button[type=submit]').on('click', setCallback('scraper'));

    function fillForm(data){
      var resource = data.resource;
      var monitor = data.monitors[0];
      var type = monitor.type;

      var $form = $('form#' + type + 'ResourceForm');

      $form.find('[data-hook=resource_id]').val(resource.id);
      $form.find('[data-hook=monitor_type]').val(type);
      $form.find('[data-hook=description]').val(resource.description);
      $form.find('[data-hook=hosts_id]').val(resource.host_id);
      $form.find('[data-hook=looptime]').val(monitor.looptime);
      $form.find('[data-hook=disabled]').prop('checked', !monitor.enable);

      var $tags = $form.find('select[name=tags]');

      function setSelectedTags (tags) {
        if(!tags||!Array.isArray(tags)||tags.length===0)return;
        tags.forEach(function(tag){
          //$tags.val(tag.id);
          $tags.append('<option value="'+ tag +'" selected="selected">'+ tag +'</option>');
        });
      }

      $tags.find('option').remove().end();
      setSelectedTags( monitor.tags );

      switch(type) {
        case 'scraper':
          var $input = $('form#scraperResourceForm input[data-hook=external]');
          if(monitor.config.external) {
            $('form#scraperResourceForm [data-hook=external_host_id]')
            .val(monitor.host_id);
            $input.prop('checked', true);
            $input.trigger('change');
          } else {
            $input.prop('checked', false);
            $input.trigger('change');
          }

          var response_options = monitor.config.response_options;
          var request_options  = monitor.config.request_options;

          for(prop in response_options){
            var value = response_options[prop];
            $form.find('[data-hook=' + prop + ']').val( value );
          }
          for(prop in request_options){
            var value = request_options[prop];
            var input = $form.find('[data-hook=' + prop + ']');
            if( input.is(':checkbox') ) {
              if( value === true || value === 'true' )
                input[0].checked = true;
            } else {
              input.val( value );
            }
          }
          //if( response_options.script ){
          //  $form.find('[data-hook=script]').trigger('change');
          //}
          if( response_options.pattern ) {
            $form.find('[data-hook=pattern]').trigger('change');
          }
          if( request_options.body && methodHasBody(request_options.method) ){
            $form.find('[data-hook=method]').trigger('change');
          }
          break;
        case 'process':
          $form.find('[data-hook=pattern]').val(monitor.config.ps.pattern);
          break;
        case 'script':
          var $script = $form.find('select[name=script_id]');
          var $disable = $form.find('input[name=disabled]');

          if( $disable.is(':checked') )
          {
            $disable.on('change',function(event){
              if(!this.checked){
                if(!$script.val()){
                  this.checked=true;
                  bootbox.alert('Please, select a script first to enable the monitor.');
                }
              }
            });
            $script.on('change', function(event){
              if( $disable.is(':checked') ){
                var msg = 'You have just added a script. Enable the monitor again?';
                bootbox.confirm(msg, function(confirmed){
                  if(confirmed) $disable.prop('checked', false);
                });
              }
            });
            $('.modal#scriptResourceModal').on('hidden.bs.modal', function(e) {
              $script.off('change');
              $disable.off('change');
            });
          }

          $script.val(monitor.config.script_id);
          $form.find('[data-hook=script_arguments]')
          .val(monitor.config.script_arguments);
          $form.find('[data-hook=script_runas]')
          .val(monitor.config.script_runas);
          break;
      }
    }

    function setupEditResourceForm($form, options){
      log('setting up for "edit"');

      var $select = $form.find('.resource-host select');
      $select.prop('multiple', false);
      $select.show();

      jQuery.ajax({
        url: "/resource/" + options.id,
        method: 'GET',
        data: { 'monitor_type': options.type }
      })
      .done(function(data){
        fillForm(data);
        $('#' + options.type + 'ResourceModal')
        .one('shown.bs.modal', function(){
          //one time AUTOCOMPLETE COMBOBOX setup
          $select.select2();
          $form.find('select#script_id').select2();
          $form.find('select[name=tags]').select2({ placeholder:"Tags", data: CustomerTags, tags:true });
          var $firstInput = $(this).find('input[type!=hidden]').first().focus();
          $(this).on('shown.bs.modal', function(){
            $firstInput.focus();
          });
        })
        .modal('show');
        $.unblockUI();
      })
      .fail(function(xhr, err, xhrStatus){
        bootbox.alert(err);
        $.unblockUI();
      });
    }

    function setupCreateResourceForm ($form, options) {
      log('setting up for "create"');
      var host = options.host;

      var $select = $form.find('.resource-host select');
      var $input  = $form.find('.resource-host input');

      $select.prop('multiple', true);
      $input.attr('value','');

      $form[0].reset();
      $.unblockUI();
      $('#' + options.type + 'ResourceModal')
      .one('shown.bs.modal', function(){
        $select.select2();
        if(host) $select.val(host).trigger('change');

        $form.find('select#script_id').select2({ placeholder:"Select a script..." });
        $form.find('select[name=tags]').select2({ placeholder:"Tags", data: CustomerTags, tags:true });

        var $firstInput = $(this).find('input[type!=hidden]').first().focus();
        $(this).on('shown.bs.modal', function(){
          $firstInput.focus();
        });
      })
      .modal('show');
    }

    function setupResourceAction (options) {
      var formSelector = 'form#' + options.type + 'ResourceForm';
      var $form = $(formSelector);
      var $next = $form.find('.resource-host').next('.host-after');
      if($next.length > 0) $next.remove();
      if(options.action == 'edit')
        setupEditResourceForm($form, options);
      else if(options.action == 'create')
        setupCreateResourceForm($form, options);
    }

    function handleResourceAction(event){
      event.preventDefault();
      event.stopPropagation();
      $.blockUI();

      var id = event.currentTarget.getAttribute('data-resource_id');
      var type = event.currentTarget.getAttribute('data-resource-type');
      var host = event.currentTarget.getAttribute('data-host_id');
      var action = event.currentTarget.getAttribute('data-action');
      var hostname = event.currentTarget.getAttribute('data-hostname');

      var data = window.resourceActionData = {
        'type': type,
        'action': action,
        'host': host,
        'hostname': hostname,
        'id': id
      };

      setupResourceAction(data);
    }

    $('.editResourceMonitor').on('click', handleResourceAction);
    $('.createResourceMonitor').on('click', handleResourceAction);

    // hook to scripts.js event script_uploaded
    window.scriptState.on('script_uploaded', function(evt,data){
      alert("Script succesfully uploaded", "Script upload",function(){
        var $scriptIdSelect = $('select[data-hook=script_id]');
        $scriptIdSelect.append('<option value="'+data.script.id+'">'+data.script.filename+'</option>');
        $scriptIdSelect.val(data.script.id);
        $scriptIdSelect.trigger('change');
        $('.modal#script-modal').modal('hide');
      });
    });

  })();

  (function(){
    (function(){
      var $externalHostInput = $("form#scraperResourceForm div#externalScraperHost");
      var $input = $("form#scraperResourceForm input[name=external]");
      $input.on("change",function(event){
        if( $input.is(":checked") ) {
          $externalHostInput.slideDown(80);
        } else {
          $externalHostInput.slideUp(80);
          $externalHostInput.find("option:eq(0)").prop('selected', true);
        }
      });

      $('.modal#scriptUpload div#scriptTemplateDescription').hide();
    })();

    function deleteResourceRequest (idResource,done) {
      jQuery.ajax({
        url: '/resource/' + idResource,
        type: 'DELETE'
      }).done(function(data) {
        if(done) done(null,data);
        else window.location.reload();
      }).fail(function(xhr, err, xhrStatus) {
        bootbox.alert(xhr.responseText);
      });
    }

    /**
    * DELETE RESEOURCE FUNCTION
    */
    $(".deleteResource").on("click",function (event) {
      bootbox.confirm('The resource will be removed. Want to continue?',
        function(confirmed){
          if(!confirmed) return;
          var $delTrigger = $(event.currentTarget);
          var idResource = $delTrigger.attr("data-resource_id");
          deleteResourceRequest(idResource);
        });
    });

    /**
    * DELETE HOST RESEOURCE FUNCTION
    */
    $(".deleteHostResource").on("click",function (event) {
      bootbox.confirm('<h3>WARNING!</h3><p>The selected HOST and all the monitors attached to it will be removed. This is operation cannot be undo.</p><p>Are you sure you want to continue?</p>',
        function(confirmed){
          if(!confirmed) return;
          var $delTrigger = $(event.currentTarget);
          var idResource = $delTrigger.attr("data-resource_id");
          deleteResourceRequest(idResource,function(){
            bootbox.alert('Ok, the host is gone. Dont\' forget to shutdown and remove the AGENT from the host.',
              function(){
                window.location.reload();
              });
          });
        });
    });

    /**
    * ON HOST RESOURCE UPDATES SUBMIT
    * @author Facundo
    */
    $('.modal#dstat-resource-modal button[type=submit]').on('click', function(event){
      event.preventDefault();
      event.stopPropagation();
      log('saving host config');

      var $form = $('#dstat-resource-modal form');
      var data = extractFormData($form);

      log('saving values %o', data);
      jQuery.ajax({
        url: '/resource/' + data.resource_id,
        type: 'PUT',
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
      }).done(function(data) {
        bootbox.alert('Limits updated',function(){
        });
      }).fail(function(xhr, err, xhrStatus) {
        bootbox.alert(xhr.responseText);
      });
    });

    function fillHostResourceForm($form, data, doneFn){
      var limits = data.monitors[0].config.limit;
      $form.find('[data-hook=cpu]').val(limits.cpu);
      $form.find('[data-hook=mem]').val(limits.mem);
      $form.find('[data-hook=cache]').val(limits.cache);
      $form.find('[data-hook=disk]').val(limits.disk);
      $form.find('[data-hook=resource_id]').val(data.resource.id);
      $form.find('[data-hook=hosts_id]').val(data.resource.host_id);

      if(doneFn) doneFn();
    }

    /**
    * ON HOST RESOURCE EDIT
    * @author Facundo
    */
    $('.dstatResourceEditAction').on('click', function(event){
      event.preventDefault();
      event.stopPropagation();

      log('edit host');
      var idResource = event.currentTarget.getAttribute('data-resource_id');
      var hostname = event.currentTarget.getAttribute('data-hostname');

      var $form = $('#dstat-resource-modal form');

      $('#dstat-resource-modal span[data-hook=hostname]').html(hostname);

      $.blockUI();
      jQuery.ajax({
        url: "/resource/" + idResource,
        method: 'GET',
        data: { 'monitor_type': 'dstat' }
      })
      .done(function(data){
        fillHostResourceForm($form, data, function(){
          $('#dstat-resource-modal').modal('show');
          $.unblockUI();
        });
      })
      .fail(function(xhr, err, xhrStatus){
        bootbox.alert(err);
        $.unblockUI();
      });
    });

    $('button.resource-search').click(function(event){
      event.preventDefault();
      event.stopPropagation();

      var idResource = event.currentTarget.getAttribute('data-resource_id');
      var $searchComponent = $('.js-searchable-box');

      var $input = $searchComponent.find('input');
      $input.val(idResource);
      $input.trigger('input');

      $searchComponent
      .find('button.search')
      .trigger('click');
    });

    /* ROW SELECTOR + MASS CHECKER + MASS DELETE */
    (function(){
      // searchbox hook
      $searchbox.on('search:start', function() {
        $('.massChecker').trigger('uncheck');
      });
      $searchbox.on('search:empty', function() {
        $('.massChecker').trigger('uncheck');
      });

      // SETUP
      var firstConfirmHeader = '<h1>Massive monitor delete</h1>Heads up!<br /><br />';
      var firstConfirmFooter = '<br />will be deleted.<h2>Are you sure?</h2>';
      var secondConfirmHeader = '<h1>Wait, really sure?</h1>' +
        'Please review the list, just in case:<br /><br />';
      var secondConfirmFooter = '<br />WILL BE DELETED<h2>Confirm wisely</h2>';
      var successTitle = 'Monitors deleted';
      var successFooter = '<br/>...you will be missed';
      var failTitle = 'Monitors deleted (some)';
      var failFooter = '<br/>...I tried to delete these monitors' +
        ' yet some of them came back with errors.' +
        '<br /><br />Please refresh now';
      var dataId = "itemId"; // the data-something where we get the id of the item
      var dataDescriptor = "itemName"; // the data-something where we get the name of the item
      var listTemplate = "{descriptor} ({id})<br />";
      var itemSelector = 'div.itemRow.selectedItem:visible';
      var apiUrlEndpoint = '/resource/';
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
  })();

  function APIMonitorEvents (options) {

    var $container = this.$container = $(options.container);

    function q (selector) {
      return $container.find(selector);
    }

    // binding events
    $responseSection = q('section[data-hook=response]');
    $requestSection = q('section[data-hook=request]');

    q('[data-hook=response-section-toggle]').on('click',function(event){
      $responseSection.slideToggle();
      $("i", this).toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
    });

    q('[data-hook=request-section-toggle]').on('click',function(event){
      $requestSection.slideToggle();
      $("i", this).toggleClass("glyphicon-chevron-down glyphicon-chevron-up");
    });

    q('[data-hook=script]').on('click change',function(event){
      q('[data-hook=script-parser-selection]').click();
    });

    q('[data-hook=pattern]').on('click change',function(event){
      q('[data-hook=match-pattern-selection]').prop('checked', Boolean(this.value));
    });

    $bodyContainer = q('[data-hook=body-container]');
    $methods = q('select[name=method]');
    $methods.on('change',function(event){
      var method = $methods.val();
      var hasBody = methodHasBody(method);
      if(hasBody) $bodyContainer.slideDown(80);
      else $bodyContainer.slideUp(80);
    });

    return this;
  }

  var requestMonitor = new APIMonitorEvents({
    container: 'form#scraperResourceForm'
  });
});
