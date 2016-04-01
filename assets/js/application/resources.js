var ResourceStates = {
  normalState  : 'normal',
  failureState : 'failure',
  loadingState : 'unknown',
  unknownState : 'updates_stopped'
};

var log = debug('eye:web:admin:resources');

//CREATE RESOURCE FUNCTION
$(function(){

  function updateResourceMonitor($el){
    var idResource = $el.find("[data-hook=resource_id]").val();

    var vals = $el.serializeArray()
    .reduce(function(obj, input) {
      obj[input.name] = input.value;
      return obj;
    }, {});

    jQuery.ajax({
      url: '/resource/' + idResource,
      type: 'PUT',
      data: vals
    }).done(function(data) {
      window.location.reload();
    }).fail(function(xhr, err, xhrStatus) {
      bootbox.alert(err);
    });
  }

  function createResourceMonitor($el){
    var vals = $el.serializeArray()
    .reduce(function(obj, input) {
      if(input.name=='hosts_id'){
        if(!obj[input.name]) obj[input.name]=[];
        obj[input.name].push(input.value);
      }
      else obj[input.name] = input.value;
      return obj;
    }, {});

    jQuery.post("/resource/" + vals.monitor_type, vals)
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

    if(action == 'edit') updateResourceMonitor($form);
    else createResourceMonitor($form);
  }

  function setCallback(type){
    return function(event){
      formSubmit(event,type);
    };
  }

  $('.modal#processResourceModal button[type=submit]').on('click', setCallback('process'));
  $('.modal#scriptResourceModal button[type=submit]').on('click', setCallback('script'));
  $('.modal#scraperResourceModal button[type=submit]').on('click', setCallback('scraper'));

  function fillForm(form, data) {
    //original signature was $form,data but:
    // $form was being redefined in the first lines
    // orginal $form was never used.
    // So I changed signature to form,data. --CG
    var resource = data.resource;
    var monitor = data.monitors[0];
    var type = monitor.type;

    var $form = $('form#' + type + 'ResourceForm');

    $form.find('[data-hook=resource_id]').val(resource.id);
    $form.find('[data-hook=monitor_type]').val(type);
    $form.find('[data-hook=description]').val(resource.description);
    $form.find('[data-hook=hosts_id]').val(resource.host_id);
    $form.find('[data-hook=looptime]').val(monitor.looptime);
    $form.find('[data-hook=enable]').prop('checked', resource.enable);

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
        $form.find('[data-hook=script_id]').val(monitor.config.script_id);
        $form.find('[data-hook=script_arguments]').val(monitor.config.script_arguments);
        break;
    }
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
      fillForm($form, data);
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
      $form.find('.resource-host').after('<div class="host-after col-sm-9"><div class="form-control">' + hostname + '</div></div>');
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
        $form.find('select#script_id').select2();

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

  function handleResourceAction(event) {
    event.preventDefault();
    event.stopPropagation();
    $.blockUI();

    var data = $(this).data();

    window.resourceActionData = {
      'type': data.resourceType,
      'action': data.action,
      'host_id': data.host_id,
      'resource_id': data.resource_id,
      'enable': data.enable,
      'hostname': data.hostname,
    };

    setupResourceAction({
      host: data.host_id,
      hostname: data.hostname,
      action: data.action,
      type: data.resourceType,
      id: data.resource_id
    });
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
    $searchComponent.find('button.search').trigger('click');
  });
});
