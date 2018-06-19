'use strict';

//var _ = require('underscore');
//var BaseView = require('../base-view');
//var FormElement = require('../form-element');
//var MonitorSelect = require('../components/monitor-select');
//var UsersSelect = require('../components/users-select');
//var TagsSelect = require('../components/tags-select');
//var FileSelect = require('../components/file-select');
//var Modal = require('../modal');
//var path = require('../../lib/path');

var PermanentFile = new (function(){

  var DEFAULT_PATH_SEPARATOR = '/';

  var TargetPathView = BaseView.extend({
    template: Templates['assets/templates/filepath-input.hbs'],
    initialize: function(options){
      BaseView.prototype.initialize.apply(this,arguments);

      var model = this.model;

      var _manual = false,
        _path = '', _basename = '', _dirname = '',
        _pathSeparator = (options.pathSeparator||DEFAULT_PATH_SEPARATOR);

      if (model) {
        if (!model.isNew()) {
          _basename = FilesStore.files
            .get(model.get('file'))
            .get('filename');
          _manual = model.get('is_manual_path');
          _dirname = model.get('dirname');

          if (_manual===true) {
            _path = model.get('path');
          } else {
            _path = model.get('dirname');
          }
        }
      }

      Object.defineProperty(this,'manual',{
        get: function(){
          return _manual;
        },
        set: function(value){
          _manual = value;
          this.trigger('change');
          return this;
        }
      });

      Object.defineProperty(this,'pathSeparator',{
        get: function(){
          return _pathSeparator;
        },
        set: function(value){
          _pathSeparator = value;
          this.trigger('change');
          return this;
        }
      });

      //
      // if the user choose the manual way , the path will include both dirname + basename
      // so the path will be equal the dirname + basename
      //
      Object.defineProperty(this,'basename',{
        get: function(){
          if (_manual) {
            return path.basename(_path);
          } else {
            return _basename;
          }
        },
        set: function (value) {
          _basename = value;
          this.trigger('change');
          return this;
        }
      });

      Object.defineProperty(this,'dirname',{
        get: function(){
          if (_manual) {
            return path.dirname(_path);
          } else {
            return _path;
          }
        }
      });

      Object.defineProperty(this,'path',{
        get: function(){
          return _path; // from user input
        },
        set: function(value){
          _path = value;
          this.trigger('change');
          return this;
        }
      });

      Object.defineProperty(this,'parsedpath',{
        get: function(){
          if (this.manual) {
            return _path; // from user input
          } else {
            return _path + _pathSeparator + _basename;
          }
        }
      });

    },
    render: function(){
      BaseView.prototype.render.apply(this,arguments);

      this.listenTo(this,'change',this.setPreview);

      this.queryByHook('is_manual_path')[0].checked = this.manual;
      this.queryByHook('path').val( this.path );

      this.setPreview();
    },
    events: {
      'change input[data-hook=path]': function(){
        this.path = this.queryByHook('path').val();
      },
      'input input[data-hook=path]': function(){
        this.path = this.queryByHook('path').val();
      },
      'change input[data-hook=is_manual_path]': function(){
        this.manual = this.queryByHook('is_manual_path')[0].checked;
      },
      'click input[data-hook=is_manual_path]': function(){
        this.manual = this.queryByHook('is_manual_path')[0].checked;
      },
    },
    setPreview: function(){
      var preview;

      if (!this.path&&!this.basename) {
        preview = '';
      } else {
        if (this.manual) {
          preview = this.path;
        } else {
          preview = this.path + this.pathSeparator + this.basename;
        }
      }

      this.queryByHook('preview').html(preview);
    }
  });

  var FormView = BaseView.extend({
    template: Templates['assets/templates/permanent-file-form.hbs'],
    initialize: function(options){
      BaseView.prototype.initialize.apply(this,arguments);

      var self = this;
      Object.defineProperty(this,'data',{
        get: function(){
          var form = new FormElement( self.$el[0] );
          var data = form.get();

          data.dirname = this.targetPath.dirname;
          data.basename = this.targetPath.basename;
          data.is_manual_path = this.targetPath.manual;
          data.path = this.targetPath.parsedpath;
          data.host_id = data.hosts;

          return data;
        },
        set: function(data){
          var form = new FormElement( self.$el[0] );
          form.set( data );
          return self;
        },
        enumerable: true
      });
    },
    reset: function(){
      this.find('form')[0].reset();
    },
    focus: function(){
      this.find('input[name=name]').focus();
    },
    events: {
      'click [data-hook=advanced-section-toggler]':'onClickAdvancedToggler'
    },
    enableWindowsMode: function(){
      var $perms = this.queryByHook('permissions');
      var $user  = this.queryByHook('os_username');
      var $group  = this.queryByHook('os_groupname');

      $perms[0].disabled = true;
      $user[0].disabled = true;
      $group[0].disabled = true;

      this.queryByHook('access-setup').slideUp();
    },
    disableWindowsMode: function(){
      var $perms = this.queryByHook('permissions');
      var $user  = this.queryByHook('os_username');
      var $group  = this.queryByHook('os_groupname');

      $perms[0].disabled = false;
      $user[0].disabled = false;
      $group[0].disabled = false;

      this.queryByHook('access-setup').slideDown();
    },
    onClickAdvancedToggler: function(){
      var $toggle = this.find('section[data-hook=advanced]');
      $toggle.slideToggle();
      this.find('[data-hook=advanced-section-toggler] i')
        .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
    },
    render: function(){
      var self = this;
      this.renderTemplate();
      this.find('span.tooltiped').tooltip();

      var hostsContainer = this.queryByHook('hosts');
      hostsContainer.select2({
        tabindex: 0,
        placeholder: 'File Host',
        data: Select2Data.PrepareHosts(this.hosts)
      });

      hostsContainer.on('change',function(event){
        var options = Array.prototype.slice.call( this.selectedOptions ); // HTMLCollection to Array
        var windows = options.find(function(option){
          var host = self.hosts.find(function(host){
            return host.id === option.value;
          });
          return /windows/i.test(host.os_name) === true;
        });

        if (windows !== undefined) {
          self.enableWindowsMode();
        } else {
          self.disableWindowsMode();
        }
      });

      this.queryByHook('looptimes').select2({
        tabindex: 0,
        placeholder: 'Monitor Looptime',
        data: Select2Data.PrepareIdValueData(this.looptimes)
      });
      this.queryByHook('looptimes').val('90000').trigger('change');

      this.monitorSelect = new MonitorSelect({
        label:'Copy From',
        collection: this.monitors.filter(function(m){
          return m.get('type') == 'file';
        })
      });

      this.monitorSelect.on('change',function(id){
        if (!id) {
          self.reset();
        } else {
          // monitor = get('monitor') ... is not a model
          var monitor = self.monitors.get(id).get('monitor');
          var config = (monitor.config||{});
          var values = _.extend(
            monitor,
            (config.ps||config),
            self.monitors.get(id).attributes
          );
          self.data = values;
        }
      });

      this.find('section[data-hook=main]').prepend( this.monitorSelect.$el );

      this.fileSelect = new FileSelect({ label: 'Select File' });
      this.find('section[data-hook=main]').append(this.fileSelect.$el);

      this.tagsSelect = new TagsSelect({ collection: this.tags, autoRender: true });
      this.find('section[data-hook=main]').append( this.tagsSelect.$el );

      this.usersSelect = new UsersSelect({ collection: this.users, autoRender: true });
      this.find('section[data-hook=advanced]').append( this.usersSelect.$el );

      this.severitySelect = new SeveritySelect({ selected:'HIGH' });
      this.find('section[data-hook=advanced]').append( this.severitySelect.$el );

      this.setFormData(this.model);

      this.targetPath = new TargetPathView({
        model: this.model,
        pathSeparator: undefined
      });
      this.targetPath.render();
      this.find('section[data-hook=main]').append( this.targetPath.$el );

      // listen to selected files changes , take the filename and append to the path
      this.listenTo(this.fileSelect,'change',function(id){
        if (!id) {
          this.targetPath.basename = '';
        } else {
          this.targetPath.basename = FilesStore.files.get(id).get('filename');
        }
      });

      this.initHelp();
    },
    initHelp: function(){
      new HelpIcon({ container: this.find('label[for=name]'), category: 'file_form', text: HelpTexts.task.name });
      new HelpIcon({ container: this.find('label[for=hosts]'), category: 'file_form', text: HelpTexts.host });
      new HelpIcon({ container: this.find('label[for=looptime]'), category: 'file_form', text: HelpTexts.looptime });
      new HelpIcon({ container: this.find('label[for=path]'), category: 'file_form', text: HelpTexts.file.path });
      new HelpIcon({ container: this.find('label[for=os_username]'), category: 'file_form', text: HelpTexts.file.os_username });
      new HelpIcon({ container: this.find('label[for=os_groupname]'), category: 'file_form', text: HelpTexts.file.os_groupname });
      new HelpIcon({ container: this.find('label[for=permissions]'), category: 'file_form', text: HelpTexts.file.permissions,
        link: 'https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation' });
    },
    setFormData: function(model){
      if (model) {
        this.data = model.attributes;
        if (model.isTemplate === true) {
          this.queryByHook('hosts-container').remove();
        } else if (!model.isNew()) {
          this.queryByHook('hosts').select2({
            tabindex: 0,
            multiple:false
          });
        }
      }
    },
    remove: function(){
      //this.usersSelect.remove();
      this.tagsSelect.remove();
      this.monitorSelect.remove();
    }
  });

  this.MonitorCRUD = function(options){
    var form, fileMonitor = new App.Models.FileMonitor(),
      modal = new Modal({ title: 'File Monitor' });

    modal.render();
    modal.$el.on('shown.bs.modal',function(){
      form.focus();
    });
    modal.$el.on('hidden.bs.modal',function(){
      form.remove();
      modal.$el.off('click','button[data-hook=save]');
    });

    form = new FormView({
      model: fileMonitor,
      //files: options.files,
      users: options.users,
      monitors: options.monitors,
      looptimes: options.looptimes,
      hosts: options.hosts,
      tags: options.tags
    });

    form.container = modal.queryByHook('container')[0];

    Object.defineProperty(this, 'form', {
      get: function(){ return form; },
      enumerable: true
    });

    this.create = function(){
      fileMonitor.clear();
      form.render();

      modal.$el.on('click','button[data-hook=save]',function(){
        var data = form.data;
        fileMonitor.set(data);
        fileMonitor.save({},{
          success: function(model, response, options){
            bootbox.alert('Monitor Created',function(){
              window.location.reload();
            });
          },
          error: function(model, response, options){
            new ServerError(response.responseJSON);
          }
        });
      });
      modal.show();
    }

    this.edit = function(id){
      fileMonitor.clear();
      fileMonitor.set('id',id);
      fileMonitor.fetch({
        success:function(model, response, options){
          form.render();

          modal.$el.on('click','button[data-hook=save]',function(){
            var data = form.data;
            fileMonitor.set(data);
            fileMonitor.save({},{
              success: function(model, response, options){
                bootbox.alert('Monitor Updated',function(){
                  window.location.reload();
                });
              },
              error: function(model, response, options){
                bootbox.alert(response.responseText);
              }
            });
          });
          modal.show();
        },
        error:function(model, response, options){
          new ServerError(response.responseJSON);
        }
      });
    }
  }

  return this;
})();
