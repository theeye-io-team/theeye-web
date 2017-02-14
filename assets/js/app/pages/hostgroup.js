/**
 * @author Facundo
 */
var TemplatesPageInit = (function(){
  var group ;
  var $tasksTags = $('#group-form input#tasks-container');
  var $monitorsTags = $('#group-form input#monitors-container');
  var $taskForm = $('#task-modal form');
  var $saveTaskButton = $('#task-modal button#task-template-save');
  var $saveMonitorButton = $('.monitor-modal button.monitor-save');
  var $submitGroupButton = $('.modal.group-modal button#group-submit');
  var $createGroupButton = $('button.create-group');
  var $deleteGroupButton = $('.panel-item.icons button.delete.btn');
  var $editGroupButton = $('.panel-item.icons button.edit.btn');
  var $regex = $('input#hostname-regex');
  var $groupModal = $('div.group-modal#group-template');
  var $taskModal = $('div.modal#task-modal');
  var logger = debug('eye:hostgroup');

  new HelpIcon({
    color:[255,255,255],
    category:'title_help',
    text: HelpTexts.titles.template_page 
  })
    .$el
    .appendTo(
      $('.table-header.admin span.title i[data-hook=help]')
    );

  $('select[name=tags]').select2({
    placeholder: 'Tags',
    tags: true,
    data: Select2Data.PrepareTags(Tags)
  });


  // scraper monitor form handler
  var scraperModal = new ScraperModal.TemplateMonitorCRUD({
    container:'[data-hook=scraper-form-container]'
  });

  $('#group-form .buttons.dropdown [data-hook=create-scraper-monitor]')
    .on('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      scraperModal.openCreateForm(group.id);
    });

  $('.modal[data-hook=scraper-monitor-modal] .modal-footer [data-hook=save]')
    .on('click',function(event){

      event.preventDefault();
      event.stopPropagation();

      var onSuccess = function(){
        var item = scraperModal.tag;
        if( ! group.id ){ // new group, not persisted to server yet
          var data = new Values(scraperModal.form.data).toArray();
        } else {
          var data = scraperModal.model.serializeArray(); // the model has an id attribute
        }

        if( ! item ){ // it is a creation
          Monitor.add(data);
        } else { // it is a edition
          Monitor.update(item,data);
        }

        scraperModal.close();
      }
      bootbox.confirm('Save Monitor?',function(confirmed){
        if(confirmed){
          //
          // this is only already created groups
          //
          if( ! group.id ){
            onSuccess();
          } else {
            scraperModal.persist(function(error,success){
              if(error){
                bootbox.alert(error);
              } else {
                bootbox.alert('Monitor Saved');
                onSuccess();
              }
            });
          }
        }
      });
      return false;
    });

  function Group () {
    this.id = null;
    this.action = '';
    this.hostname_regex = null;
    this.tasks = [];
    this.monitors = [];
    this.dstat = null;
  }

  var $dstatResourceModal = $('#dstat-monitor-modal');
  $dstatResourceModal.on('show.bs.modal', function(event){
    var inputs, dstat, $this = $(this);
    inputs = $this.find('form :input');
    if(group.dstat==null){
      dstat = {
        'cpu':'60',
        'mem':'60',
        'cache':'60',
        'disk':'60'
      };
    } else {
      dstat = group.dstat;
    }

    for(var i=0;i<inputs.length;i++){
      var input = inputs[i];
      switch(input.name){
        case 'cpu': input.value = dstat['cpu']; break;
        case 'mem': input.value = dstat['mem']; break;
        case 'cache': input.value = dstat['cache']; break;
        case 'disk': input.value = dstat['disk']; break;
      }
    }
  });

  function MonitorFormData (monitor) {
    var type = monitor.type;
    this.monitor = monitor;
    /** the data comes from the api **/
    if( monitor.config ) {
      this.monitor_type = type;
      this.description = (monitor.description||monitor.name);
      this.looptime = monitor.looptime;

      switch(type) {
        case 'script':
          this.script_id = monitor.config.script_id;
          this.script_arguments = monitor.config.script_arguments;
          this.script_runas = monitor.config.script_runas;
          break;
        case 'process':
          this.raw_search = monitor.config.ps.raw_search;
          this.is_regexp = monitor.config.ps.is_regexp;
          break;
        case 'scraper':
        case 'dstat':
        case 'psaux':
          break;
        default: throw new Error('invalid monitor type ' + type);
      }
    }
    else lodash.assign(this, monitor);
  }

  /**
   *
   * all monitor and task are items.
   *
   * @class {Item}
   * @author Facundo
   *
   */
  var Filter = {
    field: function(field) {
      var name = field.name;
      var value = field.value;

      var filterFn = this[name];
      return filterFn ? filterFn(value) : value;
    },
    script_arguments: function(value){
      var args = typeof value == 'string' ? value.split(',') : value;
      return args.map(function(val){ return val.trim(); });
    }
  };

  function Item (key, type) {
    this._key = key || Date.now(); // a simple ux timestamp
    this._type = type;
  }

  Item.prototype.set = function(data){
    var changes = {};
    for(var i=0;i<data.length;i++){
      var field = data[i];
      changes[field.name] =
      this[field.name] = Filter.field(field);
    }
    return changes;
  };

  var Task = {
    add: function add(data) {
      var item = new Item(data._key,'task');
      item.set(data);
      group.tasks.push(item);
      $tasksTags.tagsinput('add',item);
      return item;
    },
    /**
    * remove Item reference out of the group
    * @param {Item} item
    */
    remove: function remove(item, doneFn){
      var toRemove;
      var col = group.tasks.filter(function(task){
        if(task._key == item._key){
          toRemove = task;
          return false;
        }
        else return true;
      });
      group.tasks = col;

      if(toRemove.id) {
        var nextFn = function(err, data){
          $.unblockUI();
          doneFn();
          if(err) logger(err);
        };

        $.ajax({
          url: '/api/hostgroup/' + group.id + '/tasktemplate/' + item.id,
          method: 'DELETE'
        }).done(function(data){
          nextFn(null, data);
        }).fail(function(xhr){
          nextFn(xhr);
        });
      }
      else doneFn();
    },
    /**
    * update Item reference
    * @param {Item} item
    * @param {Array} updates
    */
    update: function update(item, updates){
      item.set(updates);
      $tasksTags.tagsinput('refresh');
      return item;
    }
  };

  var Monitor = {
    add: function add(data) {
      var item = new Item(data._key,'monitor');
      item.set(data);
      item.description||(item.description=item.name||item.type);
      item.name||(item.name=item.description||item.type);
      group.monitors.push(item);
      $monitorsTags.tagsinput('add',item);
      this.setDstat(item);
      return item;
    },
    /**
    * remove Item reference out of the group
    * @param {Item} item
    */
    remove: function remove(item, doneFn) {
      var toRemove;
      var col = group.monitors.filter(function(monitor){
        if(monitor._key == item._key){
          toRemove = monitor;
          return false;
        }
        else return true;
      });
      group.monitors = col;

      if(item.monitor_type == 'dstat'){
        group.dstat = null;
      }

      if(toRemove.id) {
        var nextFn = function(err, data){
          $.unblockUI();
          doneFn();
          if(err) logger(err);
        };

        $.ajax({
          url: '/api/hostgroup/' + group.id + '/monitortemplate/' + item.id,
          method: 'DELETE'
        }).done(function(data){
          nextFn(null, data);
        }).fail(function(xhr){
          nextFn(xhr);
        });
      }
      else doneFn();
    },
    /**
    * update Item reference
    * @param {Item} item
    * @param {Array} updates
    */
    update: function update(item, updates){
      var changes = item.set(updates);
      $monitorsTags.tagsinput('refresh');
      if(item.config) delete item.config;
      this.setDstat(item);
      return changes;
    },
    setDstat: function(item){
      var dstat;
      if(
        item.monitor_type=='dstat'||
        item.type=='dstat'
      ){
        if(item.config&&item.config.limit){
          dstat = item.config.limit;
        } else {
          dstat = item;
        }
        group.dstat = dstat;
      }
    }
  };

  function fillTaskForm(task, $selector) {
    $selector.find('form :input').each(function(i, e){
      var attrs = e.attributes;
      if( !attrs.type || attrs.type.value != 'hidden' ){
        var name = attrs.name && attrs.name.value ;
        if(!name) return;

        var value = task[name];
        $(e).val(value);
      }
    });
  }

  /**
  function fillMonitorForm(monitor, $selector) {
    $selector.find('form :input').each(function(i, e){
      if( e.hasAttributes() ){
        var attrs = e.attributes;
        if( !attrs.type || attrs.type.value != 'hidden' ){
          var name = attrs.name.value;
          $(e).val(monitor[name]);
        }
      }
    });
  }
  */

  function fillGroupForm(data) {
    var monitors = data.monitors;
    for(var i=0;i<monitors.length; i++) {
      var item = monitors[i];
      var monitor = Object
        .keys(item)
        .map(function(val){
          if(val=='name'){
            return { 'name': 'description', 'value': item[val] };
          }
          return { 'name': val, 'value': item[val] };
        });
      Monitor.add(monitor);
    }

    var tasks = data.tasks;
    for(var ii=0;ii<tasks.length; ii++){
      var item2 = tasks[ii];
      var task = Object
        .keys(item2)
        .map(function(val, key){
          return { 'name': val, 'value': item2[val] };
        });
      Task.add(task);
    }

    hostRegex(data.hostname_regex);
  }

  function hostRegex(regex) {
    $regex.val(regex).trigger('change');
  }

  function restartWizard() {
    logger('initializing new group');
    group = new Group();
    $('.modal form').each(function(i,f){ f.reset(); });
    $monitorsTags.tagsinput('removeAll');
    $tasksTags.tagsinput('removeAll');
  }

  function updateTaskItem (item) {
    fillTaskForm(item, $taskModal);
    var $saveButton = $taskModal.find('.modal-footer button#task-template-save');

    function resetEvents(){
      logger('reset task events');
      $saveButton.off('click', updateTask);
      $taskModal.off('hide.bs.modal', resetEvents);
      $saveButton.data('action','');
    }

    function updateTask(event){
      var doneFn = function(){
        $taskModal.modal('hide');
      };
      event.preventDefault();
      event.stopPropagation();

      bootbox.confirm('Save Task changes?',
        function(confirmed){
          if(confirmed){
            var data = $taskForm.serializeArray();
            var changes = Task.update(item, data);
            resetEvents();

            // we are updating an already created task
            // send changes to the server
            if(item.id){
              $.blockUI();

              $.ajax({
                'url': '/api/hostgroup/' + group.id + '/tasktemplate/' + item.id,
                'method': 'PUT',
                'contentType': 'application/json',
                'dataType': 'json',
                'data': JSON.stringify({'task': changes})
              }).done(function(data){
                // what next?
                $.unblockUI();
                doneFn();
              });
            }
            else doneFn();
          }
        }
      );
    }

    $saveButton.data('action','change');
    $saveButton.one('click', updateTask);
    $taskModal.one('hide.bs.modal', resetEvents);
    $taskModal.modal('show');
  }

  function removeTaskItem(item) {
    $.blockUI();
    Task.remove(item, function(err){
      $tasksTags.tagsinput('remove',item);
      $.unblockUI();
    });
  }

  function saveTaskTemplate(doneFn){
    bootbox.confirm('Save Task?',
      function(confirmed){
        if(confirmed){
          logger('saving task template');
          var task = $taskForm.serializeArray();
          var parsedData = Task.add(task);

          if(group.id !== null) {
            $.blockUI();

            var nextFn = function(err, data){
              // what next?
              $.unblockUI();
              doneFn();
            };

            $.ajax({
              'url': '/api/hostgroup/' + group.id + '/tasktemplate',
              'method': 'POST',
              'contentType': 'application/json',
              'dataType': 'json',
              'data': JSON.stringify({'task': parsedData})
            }).done(function(data){
              nextFn(null, data);
            }).fail(function(xhr){
              nextFn(xhr);
            });
          }
          else doneFn();
        }
      }
    );
  }

  function updateMonitorItem(item) {
    var monitorType = (item.type||item.monitor_type);
    var $modalSelector = $('div.modal#' + monitorType + '-monitor-modal');
    var formData = new MonitorFormData(item);
    var form = new FormElement( $modalSelector.find('form') );
    form.set( formData );
    //fillMonitorForm(formData, $modalSelector);

    var $saveButton = $modalSelector.find('.modal-footer button.monitor-save');

    function resetEvents(){
      logger('reset monitor events');
      $saveButton.off('click', updateMonitor);
      $modalSelector.off('hide.bs.modal', resetEvents);
      $saveButton.data('action','');
    }

    function updateMonitor(event){
      var doneFn = function(){
        $modalSelector.modal('hide');
      };

      bootbox.confirm('Save Monitor changes?',
        function(confirmed){
          if(confirmed){
            var data = $modalSelector.find('form').serializeArray();
            var changes = Monitor.update(item, data);
            resetEvents();
            // we are updating an already created task
            // send changes to the server
            if(item.id && group.id !== null) {
              $.blockUI();

              $.ajax({
                'url': '/admin/hostgroup/' + group.id + '/monitortemplate/' + item.id,
                'method': 'PUT',
                'contentType': 'application/json',
                'dataType': 'json',
                'data': JSON.stringify({'monitor': changes})
              }).done(function(data){
                $.unblockUI();
                doneFn();
                // what next?
              });
            }
            else doneFn();
          }
        }
      );
    }

    $saveButton.data('action','change');
    $saveButton.one('click',updateMonitor);
    $modalSelector.one('hide.bs.modal',resetEvents);
    $modalSelector.modal('show');
  }

  function removeMonitorItem(item){
    $.blockUI();
    Monitor.remove(item, function(err){
      $monitorsTags.tagsinput('remove',item);
      $.unblockUI();
    });
  }

  function saveMonitorTemplate($button, doneFn){
    bootbox.confirm('Save new Monitor?',
      function(confirmed){
        if(confirmed){
          logger('saving monitor template');
          var $monitorForm = $button.parents('.monitor-modal').find('form');
          var monitor = $monitorForm.serializeArray();
          var parsedData = Monitor.add(monitor);

          if(group.id !== null) {
            $.blockUI();

            $.ajax({
              'url': '/api/hostgroup/' + group.id + '/monitortemplate',
              'method': 'POST',
              'contentType': 'application/json',
              'dataType': 'json',
              'data': JSON.stringify({'monitor': parsedData})
            }).done(function(data){
              // what next?
              $.unblockUI();
              doneFn();
            });
          } else doneFn();
        }
      }
    );
  }

  function saveGroup(){
    $.blockUI();

    var method = (group.action=='change'?'PUT':'POST');
    var url = '/api/hostgroup/';
    if(method=='PUT') url += group.id;

    $.ajax({
      url: url,
      method: method,
      contentType: 'application/json',
      data: JSON.stringify({'group': group}),
      dataType: 'json'
    }).done(function(data){
      $.unblockUI();
      window.location.reload();
    }).fail(function(xhr,status,statusText){
      $.unblockUI();
      var msg = xhr.responseJSON ? xhr.responseJSON.data : statusText;
      alert(msg, 'Error saving hostgroup');
    });
  }

  function beginGroupCreation(){
    restartWizard();
    group.action = 'create';
    $groupModal.modal('show');
  }

  function deleteGroup($item){
    bootbox.confirm('Delete Group?',function(confirmed){
      if(!confirmed) return;
      var groupId = $item.data('group-id');
      $.ajax({
        method:'DELETE',
        url:'/api/hostgroup/' + groupId
      }).done(function(){
        window.location.reload();
      });
    });
  }

  function editGroup($target){
    logger('edit group');
    restartWizard();
    group.id = $target.data('group-id');
    $submitGroupButton.hide();
    $.ajax({
      url:'/api/hostgroup/' + group.id,
      method:'GET',
      contentType:'application/json',
      dataType:'json'
    }).done(function(data){
      fillGroupForm(data);
      group.action = 'change';
      $groupModal.modal('show');
    });
  }

  $('form').submit(function(event){
    event.preventDefault();
  });

  $regex.on('change', function(event){
    group.hostname_regex = $regex.val();
  });

  $monitorsTags.tagsinput({
    itemValue: '_key',
    itemText: 'description',
    readOnly: true
  });

  $tasksTags.tagsinput({
    itemValue: '_key',
    itemText: 'name',
    readOnly: true
  });

  /**
   *
   * EVENTS
   *
   * on item click change
   *
   * monitor/task tag elements edit/remove events
   * dynamically created elements
   *
   */
  var tagsSelector = '.bootstrap-tagsinput span.tag';
  $('body').on('click', tagsSelector, function(event){
    event.stopPropagation();
    event.preventDefault();
    var item = $(event.target).closest('.tag').data('item');

    if( /task/i.test(item._type) ){
      updateTaskItem(item);
    } else {
      if( item.type == 'scraper' ){
        scraperModal.openEditForm(group.id, item);
      } else {
        updateMonitorItem(item);
      }
    }
  });

  var removeTagsSelector = '.bootstrap-tagsinput span.tag span[data-role=remove]';
  $('body').on('click', removeTagsSelector, function(event){
    event.stopPropagation();
    event.preventDefault();
    var item = $(event.target).closest('.tag').data('item');
    if( /task/i.test(item._type) ){
      bootbox.confirm('The task '+item.name+' will be removed. Continue?',
        function(confirmed){
          if(confirmed){
            removeTaskItem(item);
          }
        }
      );
    } else {
      bootbox.confirm('The Monitor will be removed. Continue?',
        function(confirmed){
          if(confirmed){
            removeMonitorItem(item);
          }
        }
      );
    }
  });

  $saveTaskButton.on('click',function(event){
    event.preventDefault();
    event.stopPropagation();
    var $button = $(event.currentTarget);
    if( $button.data('action') != 'change' ){
      saveTaskTemplate(function(){
        $taskModal.modal('hide');
      });
    }
  });

  $saveMonitorButton.on('click',function(event){
    event.preventDefault();
    event.stopPropagation();
    var $button = $(event.currentTarget);
    if( $button.data('action') != 'change' ){
      saveMonitorTemplate($button, function(){
        $button.parents('.modal').modal('hide');
      });
    }
  });

  $submitGroupButton.on('click', function(event){
    saveGroup();
  });

  $createGroupButton.on('click', function(event){
    event.preventDefault();
    event.stopPropagation();
    $submitGroupButton.show();
    beginGroupCreation();
  });

  $deleteGroupButton.on('click', function(event){
    event.preventDefault();
    event.stopPropagation();
    var $el = $(event.currentTarget);
    deleteGroup($el);
  });

  $editGroupButton.on('click', function(event){
    event.preventDefault();
    event.stopPropagation();
    var $el = $(event.currentTarget);
    editGroup($el);
  });

  var $createGroupLink = $('div.hostgroupsContainer a#js-create-hostsgroup');
  $createGroupLink.on('click', function(event){
    $createGroupButton.trigger('click');
  });

  // emergency hooks for select2 and form cleanup
  $taskModal.on('shown.bs.modal',function(evt){
    // clean up tasks modal form when opening from create-task button
    if($(evt.relatedTarget).hasClass('create-task')) {
      $('form', this)[0].reset();
    }

    // nice guy first input focus
    $('#name', this).focus();
    // clone task select2 init
    $('#taskSelect').select2({ placeholder:'select task to clone...', allowClear:true });
    // script select2 init
    $('select#script_id', this).select2({placeholder:'Select a script...'});
  });

  $('#taskSelect',$taskModal).on('change', function(evt){
    var val = $(this).val();
    if(val) {
      var t = tasks.filter(function(i){
        return i.id == val;
      })[0];
      t = JSON.parse(JSON.stringify(t));

      t.name = "Copy of " + t.name;

      fillTaskForm(t,$taskModal);
      $('select[data-hook=script_id]', $taskForm).trigger('change');
    }else{
      $taskForm[0].reset();
      $('select[data-hook=script_id]', $taskForm).trigger('change');
    }
  });

  $('#script-monitor-modal').on('shown.bs.modal', function(evt){
    $('input[name=description]', this).first().focus();
    $('select[data-hook=script_id]', this).select2({ placeholder:'Select a script...' });
  });

  // hook to scripts.js event script_uploaded
  window.scriptState.on('script_uploaded', function(evt,script){
    alert("Script succesfully uploaded", "Script upload",function(){
      var $scriptIdSelect = $('select[data-hook=script_id]');
      $scriptIdSelect.append('<option value="'+script.id+'">'+script.filename+'</option>');
      $scriptIdSelect.val(script.id);
      $scriptIdSelect.trigger('change');
      $('.modal#script-modal').modal('hide');
    });
  });
});
