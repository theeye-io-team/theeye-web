$(function(){
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
  var group = {
    id: null,
    action: '',
    hostname_regex: null,
    tasks: [],
    monitors: []
  };

  function MonitorFormData (monitor) {
    var type = monitor.monitor_type || monitor.type;

    this.monitor = monitor;
    /** its comes from the api **/
    if( monitor.config ) {
      this.monitor_type = type;
      this.description = monitor.description;
      this.looptime = monitor.looptime;

      switch(type) {
        case 'scraper':
          this.pattern = monitor.pattern || monitor.config.pattern;
          this.url = monitor.url || monitor.config.request_options.url;
          this.timeout = monitor.timeout || monitor.config.request_options.timeout;
          break;
        case 'script':
          this.script_id = monitor.script_id || monitor.config.script_id;
          this.script_arguments = monitor.script_arguments || monitor.config.script_arguments;
          break;
        case 'process':
          this.pattern = monitor.pattern || monitor.config.ps.pattern;
          break;
        default:
          throw new Error('invalid monitor type ' + type);
          break;
      }
    } else _.assign(this, monitor);
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
    },
  }

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
  }

  var Task = {
    add: function add(data) {
      var item = new Item(data._key,'task');
      var setdata = item.set(data);
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
          doneFn()
          if(err) logger(err);
        }

        var url = '/admin/hostgroup/' + group.id +
          '/tasktemplate/' + item.id;
        $.ajax({
          url: url,
          method: 'DELETE',
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
      $tasksTags.tagsinput('refresh');
      return item;
    },
  }

  var Monitor = {
    add: function add(data) {
      var item = new Item(data._key,'monitor');
      var setdata = item.set(data);
      group.monitors.push(item);
      $monitorsTags.tagsinput('add',item);
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

      if(toRemove.id) {
        var nextFn = function(err, data){
          $.unblockUI();
          doneFn()
          if(err) logger(err);
        }

        var url = '/admin/hostgroup/' + group.id +
          '/monitortemplate/' + item.id;
        $.ajax({
          url: url,
          method: 'DELETE',
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
      return item;
    },
  }

  function fillTaskForm(task, $selector) {
    $selector.find('form :input').each(function(i, e){
      var attrs = e.attributes;
      if( !attrs.type || attrs.type.value != 'hidden' ){
        var name = attrs.name && attrs.name.value ;
        if(!name) return;

        var value = task[name];
        $(e).val(value);
      }
    })
  }

  function fillMonitorForm(monitor, $selector) {
    $selector.find('form :input').each(function(i, e){
      if( e.hasAttributes() ){
        var attrs = e.attributes;
        if( !attrs.type || attrs.type.value != 'hidden' ){
          var name = attrs.name.value;
          $(e).val(monitor[name]);
        }
      }
    })
  }

  function fillGroupForm(data) {
    var monitors = data.monitors;
    for(var i=0;i<monitors.length; i++)
    {
      var item = monitors[i]
      var monitor = Object
        .keys(item)
        .map(function(val){
          if(val=='name')
            return { 'name': 'description', 'value': item[val] };

          return { 'name': val, 'value': item[val] };
        });
      Monitor.add(monitor);
    }

    var tasks = data.tasks;
    for(var i=0;i<tasks.length; i++){
      var item = tasks[i]
      var task = Object
        .keys(item)
        .map(function(val, key){
          return { 'name': val, 'value': item[val] };
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
    group = {
      id:null,
      action:'',
      hostname_regex: null,
      tasks: [],
      monitors: []
    };
    $('.modal form').each(function(i,f){ f.reset() });
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
        $taskModal.modal('hide')
      }
      event.preventDefault()
      event.stopPropagation()

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
              var url = '/admin/hostgroup/' + group.id +
                '/tasktemplate/' + item.id;

              $.ajax({
                'url': url,
                'method': 'PUT',
                'contentType': 'application/json',
                'dataType': 'json',
                'data': JSON.stringify({'task': changes})
              }).done(function(data){
                // what next?
                $.unblockUI();
                doneFn()
              });
            }
            else doneFn()
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

          if(group.id != null) {
            $.blockUI();
            var url = '/admin/hostgroup/' + group.id +
              '/tasktemplate';

            var nextFn = function(err, data){
              // what next?
              $.unblockUI();
              doneFn()
            }

            $.ajax({
              'url': url,
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
          else doneFn()
        }
      }
    )
  }

  function updateMonitorItem(item) {
    var monitorType = (item.type||item.monitor_type);
    var $modalSelector = $('div.modal#' + monitorType + '-monitor-modal');
    var formData = new MonitorFormData(item);
    fillMonitorForm(formData, $modalSelector);

    var $saveButton = $modalSelector
      .find('.modal-footer button.monitor-save');

    function resetEvents(){
      logger('reset monitor events');
      $saveButton.off('click', updateMonitor);
      $modalSelector.off('hide.bs.modal', resetEvents);
      $saveButton.data('action','');
    }

    function updateMonitor(event){

      var doneFn = function(){
        $modalSelector.modal('hide')
      }

      bootbox.confirm('Save Monitor changes?',
        function(confirmed){
          if(confirmed){
            var data = $modalSelector.find('form').serializeArray();
            var changes = Monitor.update(item, data);
            resetEvents();
            // we are updating an already created task
            // send changes to the server
            if(item.id && group.id!=null){
              $.blockUI();
              var url = '/admin/hostgroup/' + group.id +
                '/monitortemplate/' + item.id;

              $.ajax({
                'url': url,
                'method': 'PUT',
                'contentType': 'application/json',
                'dataType': 'json',
                'data': JSON.stringify({'monitor': changes})
              }).done(function(data){
                $.unblockUI()
                doneFn()
                // what next?
              });
            }
            else doneFn()
          }
        }
      );
    }

    $saveButton.data('action','change');
    $saveButton.one('click', updateMonitor);
    $modalSelector.one('hide.bs.modal', resetEvents);
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
          $monitorForm = $button.parents('.monitor-modal').find('form');
          var monitor = $monitorForm.serializeArray();
          var parsedData = Monitor.add(monitor);

          if(group.id != null) {
            $.blockUI();
            var url = '/admin/hostgroup/' + group.id +
              '/monitortemplate';

            $.ajax({
              'url': url,
              'method': 'POST',
              'contentType': 'application/json',
              'dataType': 'json',
              'data': JSON.stringify({'monitor': parsedData})
            }).done(function(data){
              // what next?
              $.unblockUI();
              doneFn()
            });
          }
          else doneFn()
        }
      }
    )
  }

  function saveGroup(){
    $.blockUI();

    var method = (group.action=='change'?'PUT':'POST');
    var url = '/admin/hostgroup/';
    if(method=='PUT') url += group.id;

    $.ajax({
      url: url,
      method: method,
      contentType: 'application/json',
      data: JSON.stringify({'group': group}),
      dataType: 'json',
    }).done(function(data){
      $.unblockUI();
      //window.location.reload();
    });
  }

  function beginGroupCreation(){
    restartWizard();
    group.action = 'create';
    $groupModal.modal('show');
  }

  function deleteGroup($item){
    var groupId = $item.data('group-id');
    $.ajax({
      method:'delete',
      url:'/admin/hostgroup/' + groupId,
    }).done(function(){
      window.location.reload();
    });
  }

  function editGroup($target){
    logger('edit group');
    restartWizard();
    group.id = $target.data('group-id');
    $('.group-modal#group-template button#group-submit').hide();
    $.ajax({
      url:'/admin/hostgroup/' + group.id,
      method:'get',
      contentType:'application/json',
      dataType:'json',
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
    readOnly: true,
  });

  $tasksTags.tagsinput({
    itemValue: '_key',
    itemText: 'name',
    readOnly: true,
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
    event.stopPropagation()
    event.preventDefault()
    var item = $(event.target).closest('.tag').data('item');

    if( item._type == 'task' ){
      updateTaskItem(item);
    } else
    if( item._type == 'monitor' ){
      updateMonitorItem(item);
    }
  });

  var removeTagsSelector = '.bootstrap-tagsinput span.tag span[data-role=remove]';
  $('body').on('click', removeTagsSelector, function(event){
    event.stopPropagation()
    event.preventDefault()
    var item = $(event.target).closest('.tag').data('item');

    if( item._type == 'task' ){
      bootbox.confirm('The Task will be removed. Continue?',
        function(confirmed){
          if(confirmed){
            removeTaskItem(item);
          }
        }
      );
    } else
    if( item._type == 'monitor' ){
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
    event.preventDefault()
    event.stopPropagation()
    var $button = $(event.currentTarget);
    if( $button.data('action') != 'change' ){
      saveTaskTemplate(function(){
        $taskModal.modal('hide');
      });
    }
  });

  $saveMonitorButton.on('click',function(event){
    event.preventDefault()
    event.stopPropagation()
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
    $('.group-modal#group-template button#group-submit').show();
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
    // select2 init
    $('select#script_id', this).select2({placeholder:'Select a script...'});
  });

  $('#script-monitor-modal').on('shown.bs.modal', function(evt){
    $('input[name=description]', this).first().focus();
    $('select#script_id', this).select2({placeholder:'Select a script...'});
  });

});
