var ResourceStates = {
  normalState  : 'normal',
  failureState : 'failure',
  loadingState : 'unknown',
  unknownState : 'updates_stopped'
};

var log = debug('eye:web:admin:resources');

//CREATE RESOURCE FUNCTION
$(function(){

  function getFormInputValues (inputs) {
    var values = {};
    inputs.each(function(){
      var input = this;
      if(input.name=='disabled' && input.type=='checkbox'){
        values.enable = !input.checked;
      } else if(input.name=='hosts_id') {
        if( !values[input.name] ) values[input.name]=[];
        values[input.name].push(input.value);
      } else {
        values[input.name] = input.value;
      }
    });
    return values;
  }

  function updateResourceMonitor($el){
    var idResource = $el.find("[data-hook=resource_id]").val();
    var inputs = $el.find(":input");
    var values = getFormInputValues(inputs);

    jQuery.ajax({
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
    var inputs = $el.find(":input");
    var values = getFormInputValues(inputs);

    jQuery
    .post("/resource/" + values.monitor_type, values)
    .done(function(data){
      window.location.reload();
    })
    .fail(function(xhr, err, xhrStatus){
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

        $form.find('[data-hook=url]').val(monitor.config.request_options.url);
        $form.find('[data-hook=pattern]').val(monitor.config.pattern);
        $form.find('[data-hook=timeout]').val(monitor.config.request_options.timeout);
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
          })
        }

        $script.val(monitor.config.script_id);
        $form.find('[data-hook=script_arguments]')
          .val(monitor.config.script_arguments);
      break;
    };
  }

  function setupEditResourceForm($form, options){
    log('setting up for "edit"');

    var $select = $form.find('.resource-host select');
    var $input  = $form.find('.resource-host input');
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

          //remove select2 if present - no need
          // $select.data('select2') && $select.select2('destroy');

          $select.select2();
          $form.find('select#script_id').select2();
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

  function setupCreateResourceForm($form, options){
    log('setting up for "create"');
    var host = options.host;
    var hostname = options.hostname;

    var $select = $form.find('.resource-host select');
    var $input  = $form.find('.resource-host input');

    if(host){
      $select.hide();
      $input.attr('value', host);
      $form.find('.resource-host')
        .after('<div class="host-after col-sm-9"><div class="form-control">' + hostname + '</div></div>');
    } else {
      $select.prop('multiple', true);
      $select.show();
      $input.attr('value','');
    }

    $form[0].reset();
    $.unblockUI();
    $('#' + options.type + 'ResourceModal')
      .one('shown.bs.modal', function(){
        //one time AUTOCOMPLETE COMBOBOX setup

        //remove select2 if present
        // $select.data('select2') && $select.select2('destroy');

        $select.select2();
        $form.find('select#script_id').select2({placeholder:"Select a script..."});

        var $firstInput = $(this).find('input[type!=hidden]').first().focus();
        $(this).on('shown.bs.modal', function(){
          $firstInput.focus();
        });
      })
      .modal('show');
  }

  function setupResourceAction(options){
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

});

$(function(){

  (function(){
    var $externalHostInput = $("form#scraperResourceForm div#externalScraperHost");
    var $input = $("form#scraperResourceForm input[name=external]");
    $input.on("change",function(event){
      if( $input.is(":checked") ) {
        $externalHostInput.slideDown(100);
      } else {
        $externalHostInput.slideUp(100);
        $externalHostInput.find("option:eq(0)").prop('selected', true);
      }
    });

    $('.modal#scriptUpload div#scriptTemplateDescription').hide();
  })();

  /**
   * DELETE RESEOURCE FUNCTION
   */
  $(".deleteResource").on("click",function (event) {
    bootbox.confirm('The resource will be removed. Want to continue?',
      function(confirmed){
        if(!confirmed) return;

        var $delTrigger = $(event.currentTarget);
        var idResource = $delTrigger.attr("data-resource_id");

        jQuery.ajax({
          url: '/resource/' + idResource,
          type: 'DELETE'
        }).done(function(data) {
          window.location.reload();
        }).fail(function(xhr, err, xhrStatus) {
          bootbox.alert(xhr.responseText);
        });
      });
  });

  /**
   * ON HOST RESOURCE UPDATES SUBMIT
   * @author Facundo
   */
  $('.modal#dstatResourceModal button[type=submit]').on('click', function(event){
    event.preventDefault();
    event.stopPropagation();
    log('saving host config');

    var $form = $('#dstatResourceModal form');
    var idResource = $form.find('[data-hook=resource_id]').val();
    var values = $form.serializeArray();

    values.push({
      'name':'monitor_type',
      'value':'dstat'
    });

    log('saving values %o', values);
    jQuery.ajax({
      url: '/resource/' + idResource,
      type: 'PUT',
      data: values
    }).done(function(data) {
      window.location.reload();
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
    var idHost = event.currentTarget.getAttribute('data-host_id');
    var hostname = event.currentTarget.getAttribute('data-hostname');

    var $form = $('#dstatResourceModal form');

    $('#dstatResourceModal span[data-hook=hostname]').html(hostname);

    $.blockUI();
    jQuery.ajax({
      url: "/resource/" + idResource,
      method: 'GET',
      data: { 'monitor_type': 'dstat' }
    })
    .done(function(data){
      fillHostResourceForm($form, data, function(){
        $('#dstatResourceModal').modal('show');
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
    var successFooter = '<br/>...you will be missed :(';
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
