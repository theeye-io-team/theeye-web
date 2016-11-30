/* global bootbox, Tags, $searchbox, debug */

// var bootbox = require('bootbox');
// var debug = require('debug');
// var MonitorCopy = require('../app/view/components/monitor-copy.js');
// var Modal = require('../app/view/modal');
// var ScraperModal = require('../app/view/scraper/modal');
// var Select2Data = require('../app/lib/select2data');

$(function(){

  var log = debug('eye:web:admin:resources');
  var _users = new App.Collections.Users();
  _users.fetch({
    data: {
      where: {
        credential: {
          $ne:'agent'
        }
      }
    },
  });
  window.Users = _users;

  (function(){
    $('button[data-hook=copy]').on('click',function(event){
      event.preventDefault();
      event.stopPropagation();

      var id = $(this).data('monitor');
      var monitor = monitors.get(id);

      var modal = new Modal({ title: 'Copy monitor ' + monitor.get('name') });
      modal.render();

      var hosts = new Backbone.Collection(window.Hosts);
      hosts.remove( monitor.get('host_id') );
      var view = new MonitorCopy({
        collection: hosts,
        model: monitor, 
      });

      modal.content = view;
      modal.$el.on('hidden.bs.modal',function(){
        view.remove();
        modal.remove();
      });

      modal
        .find('button[data-hook=save]')
        .on('click',function(event){
          var hosts = view.values;

          hosts.forEach(function(id){
            var instance = monitor.clone();
            instance.save({ host: id, host_id: id },{
              success:function(model, response, options){
                bootbox.alert('monitors created',function(){
                  window.location.reload();
                });
              },
              error:function(model, response, options){
                bootbox.alert(JSON.stringify(response));
              }
            });
          });
        });

      modal.show();

      return false;
    });
  })();

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
      var values = (new FormElement($el)).get();

      if (values.script_runas) {
        if ( /%script%/.test(values.script_runas) === false ) {
          bootbox.alert('The script runas must include the "%script%" keyword');
          return;
        }
      }

      $.ajax({
        url: '/resource/' + idResource,
        type: 'PUT',
        data: values
      }).done(function(data) {
        bootbox.alert('monitor updated',function(){
          window.location.reload();
        });
      }).fail(function(xhr, err, xhrStatus) {
        bootbox.alert(err);
      });
    }

    function createResourceMonitor($el){
      var values = (new FormElement($el)).get();

      if (values.script_runas) {
        if ( /%script%/.test(values.script_runas) === false ) {
          bootbox.alert('The script runas must include the "%script%" keyword');
          return;
        }
      }

      $.ajax({
        method:'POST',
        url:'/resource/' + values.monitor_type,
        data: JSON.stringify(values),
        contentType: "application/json; charset=utf-8"
      }).done(function(data){
        bootbox.alert('Monitor created',function(){
          window.location.reload();
        });
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
    $('.modal#psauxResourceModal button[type=submit]').on('click', setCallback('psaux'));

    function fillForm ($form,resource) {
      var monitor = resource.monitor;
      var type = monitor.type;

      //var $form = $('form#' + type + 'ResourceForm');
      $form.find('[data-hook=resource_id]').val(resource.id);
      $form.find('[data-hook=monitor_type]').val(type);
      $form.find('[data-hook=description]').val(resource.description);
      $form.find('[data-hook=hosts_id]').val(resource.host_id);
      $form.find('[data-hook=disabled]').prop('checked', !monitor.enable);
      var acls = $form.find('select[data-hook=acl]');
      acls.val(resource.acl).trigger('change');

      if (monitor.looptime) {
        $form.find('[data-hook=looptime]').val(monitor.looptime);
      }

      var $tags = $form.find('select[name=tags]');

      function setSelectedTags (tags) {
        if(!tags||!Array.isArray(tags)||tags.length===0)return;
        tags.forEach(function(tag){
          //$tags.val(tag.id);
          $tags.append('<option value="'+ tag +'" selected="selected">'+ tag +'</option>');
        });
      }

      $tags.find('option').remove().end();
      setSelectedTags(monitor.tags);

      switch (type) {
        case 'process':
          $form.find('[name=raw_search]').val(monitor.config.ps.raw_search);
          $form.find('[name=is_regexp]').prop('checked',monitor.config.ps.is_regexp);
          break;
        case 'script':
          var $script = $form.find('select[name=script_id]');
          //esto adosa el script_id al boton de editar/crear script
          $('a.scripter', $form).data('script-id', monitor.config.script_id);

          $script.val(monitor.config.script_id);
          $form.find('[data-hook=script_arguments]').val(monitor.config.script_arguments);
          $form.find('[data-hook=script_runas]').val(monitor.config.script_runas);
          break;
      }
    }

    function setupEditResourceForm($form, options){
      var type = options.type;

      jQuery.ajax({
        url: "/api/resource/" + options.id,
        method: 'GET'
      }).done(function(resource){

        var usersSelect = new UsersSelect({ collection: _users });
        usersSelect.render();

        $form.append( usersSelect.$el );
        fillForm($form,resource);
        var $modal = $('#'+type+'ResourceModal');
        $modal.one('hidden.bs.modal',function(){
          usersSelect.remove();
        });

        function bindModalElementsEvents(){
          //one time AUTOCOMPLETE COMBOBOX setup
          var $hostSelect = $form.find('.resource-host select');
          $hostSelect.prop('multiple', false);
          $hostSelect.show();
          $hostSelect.select2();

          var $tagsSelect = $form.find('select[name=tags]');
          $tagsSelect.select2({
            placeholder:"Tags",
            data:Select2Data.PrepareTags(Tags),
            tags:true
          });

          // only script monitor has scripts selection
          if(type=='script'){
            var $scriptSelect = $form.find('select#script_id');
            $scriptSelect.select2({
              allowClear:true,
              placeholder:'Select a script...'
            });
            $scriptSelect.on('change',function(event){
              var val = $(this).val();
              if(val) {
                $('a.scripter', '#'+type+'ResourceModal')
                .text('Update script')
                .removeClass('createScript')
                .addClass('editScript')
                .data('script-id', val);
              } else {
                $('a.scripter', '#'+type+'ResourceModal')
                .text('Create script')
                .removeClass('editScript')
                .addClass('createScript')
                .data('script-id', null);
              }
            });
            $scriptSelect.trigger('change');
          }

          var $firstInput = $modal.find('input[type!=hidden]').first().focus();
          $modal.one('shown.bs.modal',function(){ $firstInput.focus(); });
        }

        $modal.one('shown.bs.modal',bindModalElementsEvents);

        if(type=='dstat'){
          (function bindSubmitButton(){
            // ^ limit the scope
            var $submitBtn = $modal.find('button[type=submit]');

            $modal.one('hidden.bs.modal',function(){
              // remove click event bindings
              $submitBtn.off('click');
            });

            $modal.one('show.bs.modal',function(){
              // bind click event
              $submitBtn.on('click', function(event){
                event.preventDefault();
                event.stopPropagation();
                log('saving host config');

                var data = (new FormElement($form)).get();

                log('saving values %o', data);
                jQuery.ajax({
                  url: '/resource/' + data.resource_id,
                  type: 'PUT',
                  data: JSON.stringify(data),
                  contentType: "application/json; charset=utf-8"
                }).done(function(data) {
                  bootbox.alert('Limits updated');
                  $modal.modal('hide');
                }).fail(function(xhr, err, xhrStatus) {
                  bootbox.alert(xhr.responseText);
                });
              });
            });
          })();
        }
        $modal.modal('show');
        $.unblockUI();
      }).fail(function(xhr, err, xhrStatus){
        bootbox.alert(err);
        $.unblockUI();
      });
    }

    function setupCreateResourceForm ($form, options) {
      log('setting up for "create"');
      var host = options.host;
      var $select = $form.find('.resource-host select');
      var $input  = $form.find('.resource-host input');
      var $modal = $('#' + options.type + 'ResourceModal');

      $select.prop('multiple', true);
      $input.attr('value','');

      var monitorCopy = new MonitorCopyFrom({
        collection:  monitors.filter(function(m){
          return m.get('type') == options.type;
        })
      });
      $form.prepend( monitorCopy.$el );

      monitorCopy.on('change',function(id){
        if (!id) {
          $form[0].reset();
        } else {
          var monitor = monitors.get(id),
            form = new FormElement($form);

          var attrs = monitor.attributes;
          var values = _.extend({
            description: monitor.get('name')
          },attrs.resource,attrs,(attrs.config.ps||attrs.config));

          delete values.host, delete values.host_id;
          form.set(values);
        }
      });

      var usersSelect = new UsersSelect({ collection: _users });
      usersSelect.render();
      $form.append( usersSelect.$el );

      $modal.one('hidden.bs.modal',function(){
        usersSelect.remove();
        monitorCopy.remove();
      });

      $form[0].reset();
      $.unblockUI();

      function onShowModal () {
        $select.select2();
        if(host) $select.val(host).trigger('change');

        $form.find('select#script_id')
          .select2({allowClear:true, placeholder:"Select a script..." })
          .on('change', function(event){
            if($(this).val()) {
              $('a.scripter', $modal)
                .text('Update script')
                .removeClass('createScript')
                .addClass('editScript')
                .data('script-id', $(this).val());
            } else {
              $('a.scripter', $modal)
                .text('Create script')
                .removeClass('editScript')
                .addClass('createScript')
                .data('script-id', null);
            }
          })
          .trigger('change');

        $form.find('select[name=tags]').select2({ placeholder:"Tags", data: Select2Data.PrepareTags(Tags), tags:true });

        var $firstInput = $(this).find('input[type!=hidden]').first().focus();
        $(this).on('shown.bs.modal', function(){
          $firstInput.focus();
        });
      }

      $modal.one('shown.bs.modal', onShowModal);
      $modal.modal('show');
    }

    (function(){
      var $dstatHosts = $('[data-hook=dstat-modal] form select[data-hook=hosts]');
      $dstatHosts.select2({
        placeholder: 'Hosts',
        data: Select2Data.PrepareHosts(window.Hosts)
      });
    })();

    function createStatMonitor (options) {
      var $modal = $('[data-hook=dstat-modal]');
      var $submitBtn = $modal.find('button[type=submit]');
      var $hosts = $modal.find('[data-hook=hosts-container]');

      var $form = $modal.find('form');
      var usersSelect = new UsersSelect({ collection: _users });
      usersSelect.render();
      $form.append( usersSelect.$el );

      $modal.one('hidden.bs.modal',function(){
        $submitBtn.off('click');
        $hosts.hide();
        usersSelect.remove();
      });
      $modal.one('show.bs.modal',function(){
        $hosts.show();

        $submitBtn.on('click', function(event){
          event.preventDefault();
          event.stopPropagation();
          log('saving host config');

          var data = (new FormElement($form)).get();

          log('saving values %o', data);
          jQuery.ajax({
            url: '/resource',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8"
          }).done(function(data) {
            bootbox.alert('Host Stats monitor created',function(){
              window.location.reload();
            });
          }).fail(function(xhr, err, xhrStatus) {
            bootbox.alert(xhr.responseText);
          });
        });
      });
      $modal.modal('show');
      $.unblockUI();
    }

    function setupResourceAction (options) {
      if (options.action=='create' && options.type=='dstat') {

        createStatMonitor(options);

      } else {
        var formSelector = 'form#' + options.type + 'ResourceForm';
        var $form = $(formSelector);
        var $next = $form.find('.resource-host').next('.host-after');
        if ($next.length > 0) $next.remove();
        if (options.action == 'edit') {
          setupEditResourceForm($form, options);
        } else if (options.action == 'create') {
          setupCreateResourceForm($form, options);
        }
      }
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

    $('[data-hook=edit-process-monitor]').on('click', handleResourceAction);
    $('[data-hook=edit-script-monitor]').on('click', handleResourceAction);
    $('[data-hook=edit-dstat-monitor]').on('click', handleResourceAction);
    $('[data-hook=create-monitor').on('click', handleResourceAction);

    // hook to scripts.js event script_uploaded
    window.scriptState.on('script_uploaded', function(evt,result){
      var script = result.script;
      alert("Script succesfully uploaded", "Script upload",function(){
        var $scriptIdSelect = $('select[data-hook=script_id]');
        //remove previous script option
        $('option[value='+script.id+']').remove();
        $scriptIdSelect.append('<option value="'+script.id+'">'+script.filename+'</option>');
        $scriptIdSelect.val(script.id);
        $scriptIdSelect.trigger('change');
        $('.modal#script-modal').modal('hide');
      });
    });

  })();

  $('.modal#scriptUpload div#scriptTemplateDescription').hide();

  (function(){
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
      event.preventDefault();
      bootbox.confirm('The resource will be removed. Want to continue?',
        function(confirmed){
          if(!confirmed) return;
          var $delTrigger = $(event.currentTarget);
          var idResource = $delTrigger.attr("data-resource_id");
          deleteResourceRequest(idResource);
        });
      return false;
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

    function fillHostResourceForm ($form,resource,doneFn) {
      var limits = resource.monitor.config.limit;
      $form.find('[data-hook=cpu]').val(limits.cpu);
      $form.find('[data-hook=mem]').val(limits.mem);
      $form.find('[data-hook=cache]').val(limits.cache);
      $form.find('[data-hook=disk]').val(limits.disk);
      $form.find('[data-hook=looptime]').val(resource.monitor.looptime);
      $form.find('[data-hook=resource_id]').val(resource.id);
      $form.find('[data-hook=hosts_id]').val(resource.host_id);
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

      var $form = $('#dstatResourceModal form');

      $('#dstatResourceModal span[data-hook=hostname]').html(hostname);

      $.blockUI();
      jQuery.ajax({
        url: '/api/resource/' + idResource,
        method: 'GET'
      }).done(function(resource){
        fillHostResourceForm($form, resource, function(){
          $('#dstatResourceModal').modal('show');
          $.unblockUI();
        });
      }).fail(function(xhr, err, xhrStatus){
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
            if(!result1) return;
            bootbox.confirm(secondConfirmHeader + taskRows + secondConfirmFooter, function(result2){
              if(!result2) return;
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

              $.when
              .apply($, deleteRequests)
              .then()
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

  /**
   *
   * scraper modal CRUD
   *
   */
  (function setupScraperModal(){
    var formContainer = '[data-hook=scraper-form-container]';
    var scraperModal = new ScraperModal.MonitorCRUD(formContainer);

    // on click create , render form
    function onClickCreate(event){
      event.preventDefault();
      event.stopPropagation();
      scraperModal.create();
    }
    // on click edit , fetch scraper and render form
    function onClickEdit(event){
      event.preventDefault();
      event.stopPropagation();
      var scraper_id = event.currentTarget.getAttribute('data-resource_id');
      scraperModal.edit(scraper_id);
    }

    $('.dropdown.resource [data-hook=create-scraper-monitor]').on('click',onClickCreate);
    $('.panel-group [data-hook=create-scraper-monitor]').on('click',onClickCreate);
    $('[data-hook=edit-scraper-monitor]').on('click',onClickEdit);
  })();


  (function editHost(){
    $('[data-hook=edit-host-monitor]').on('click',function(event){
      event.preventDefault();
      var id = this.dataset.resource_id;
      var host = new App.Models.Monitor({id:id});
      host.fetch({
        success:function(){

          var modal = new Modal({ title: host.attributes.hostname });
          modal.render();

          var users = new UsersSelect({ collection: _users });
          users.render();
          users.values = host.attributes.acl;

          // append content
          modal.content = users;

          modal.$el.on('hidden.bs.modal',function(){
            users.remove();
            modal.remove();
          });

          modal
            .find('[data-hook=save]')
            .on('click',function(){
              var values = users.values;
              host.attributes.acl = values;
              //if (!host.attributes.looptime)

              // dont use this! :
              //host.save();
              // use this instead :
              // ask @facugon
              var data = JSON.stringify(host.attributes);
              $.ajax({
                method:'PATCH',
                url:'/api/resource/' + id,
                data: data,
                contentType: "application/json; charset=utf-8"
              }).done(function(){
                bootbox.alert('acl\'s updated');
                modal.hide();
              }).fail(function(res){
                bootbox.alert(res);
              });
            });

          modal.show();
        },
        failure:function(){
        }
      });
      return false;
    });
  })();

});
