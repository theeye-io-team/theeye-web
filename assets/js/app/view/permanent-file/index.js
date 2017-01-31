'use strict';

//var _ = require('underscore');
//var BaseView = require('../base-view');
//var FormElement = require('../form-element');
//var MonitorSelect = require('../components/monitor-select');
//var UsersSelect = require('../components/users-select');
//var TagsSelect = require('../components/tags-select');
//var FileSelect = require('../components/file-select');
//var Modal = require('../modal');

var PermanentFile = new (function(){

  var FormView = BaseView.extend({
    template: Templates['assets/templates/permanent-file-form.hbs'],
    initialize: function(options){
      BaseView.prototype.initialize.apply(this,arguments);

      var self = this;
      Object.defineProperty(this,'data',{
        get: function(){
          var form = new FormElement( self.$el[0] );
          return form.get();
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
      this.find('input[name=description]').focus();
    },
    events: {
      'click [data-hook=advanced-section-toggler]':'onClickAdvancedToggler',
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

      this.tagsSelect = new TagsSelect({ collection: this.tags, autoRender: true });
      this.find('[data-hook=main]').append( this.tagsSelect.$el );

      //this.usersSelect = new UsersSelect({ collection: this.users, autoRender: true });
      //this.find('[data-hook=advanced]').append( this.usersSelect.$el );

      //this.severitySelect = new SeveritySelect({ selected:'HIGH' });
      //this.find('form [data-hook=advanced]').append( this.severitySelect.$el );

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
            { description: monitor.name },
            monitor,
            (config.ps||config),
            self.monitors.get(id).attributes
          );
          self.data = values;
        }
      });

      this.find('form').prepend( this.monitorSelect.$el );

      this.fileSelect = new FileSelect({ label:'Select File' });
      this.fileSelect.on('change',function(id){ });
      this.find('form section[data-hook=main]').append(this.fileSelect.$el);

      this.queryByHook('hosts').select2({
        placeholder: 'File Host',
        data: Select2Data.PrepareHosts(this.hosts)
      });
      this.queryByHook('looptimes').select2({
        placeholder: 'Monitor Looptime',
        data: Select2Data.PrepareIdValueData( this.looptimes )
      });

      this.setFormData(this.model);

      this.initHelp();
    },
    initHelp: function(){
      new HelpIcon({
        container: this.find('label[for=name]'),
        category: 'file_form',
        text: HelpTexts.task.name
      });
      new HelpIcon({
        container: this.find('label[for=host]'),
        category: 'file_form',
        text: HelpTexts.host
      });
      new HelpIcon({
        container: this.find('label[for=looptime]'),
        category: 'file_form',
        text: HelpTexts.looptime
      });
      new HelpIcon({
        container: this.find('label[for=path]'),
        category: 'file_form',
        text: HelpTexts.file.path
      });
      new HelpIcon({
        container: this.find('label[for=uid]'),
        category: 'file_form',
        text: HelpTexts.file.uid
      });
      new HelpIcon({
        container: this.find('label[for=gid]'),
        category: 'file_form',
        text: HelpTexts.file.gid
      });
      new HelpIcon({
        container: this.find('label[for=permissions]'),
        category: 'file_form',
        text: HelpTexts.file.permissions,
        link: 'https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation'
      });
    },
    setFormData: function(model){
      if (model) {
        this.data = model.attributes;
        if (model.isTemplate === true) {
          this.queryByHook('hosts-container').remove();
        } else if (!model.isNew()) {
          this.queryByHook('hosts').select2({ multiple:false });
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
            bootbox.alert(response.responseText);
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
          bootbox.alert(response.responseText);
          done(new Error(response.responseText));
        }
      });
    }
  }

  return this;
})();
