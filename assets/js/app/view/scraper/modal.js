/* global Scraper, App, bootbox */
'use strict';

//var _ = require('underscore');
//var MonitorSelect = require('../components/monitor-select');
//var TaskSelect = require('../components/task-select');
//var Modal = require('../modal');

var ScraperModal = new (function ScraperModal(){
  function initializeForm(container){
    // initialize a scraper form
    var view = new Scraper.FormView({
      looptimes: window.Looptimes,
      timeouts: window.Timeouts,
      hosts: window.Hosts,
      tags: window.Tags,
      users: window.Users
    });
    view.container = container;
    return view ;
  }

  function Monitor (){
    var _modal = new Modal({ title: 'Website Monitor' });
    _modal.render();

    var _form = initializeForm( _modal.queryByHook('container')[0] );
    Object.defineProperty(this, 'form', {
      get: function(){ return _form; },
      enumerable: true
    });


    (function initializeModal($modal){
      $modal.on('shown.bs.modal', function(){
        _form.focus();
      });
      // once hide modal remove scraper form
      $modal.on('hidden.bs.modal', function(){
        _form.remove();
        $modal.off('click','button[data-hook=save]');
      });
    })(_modal.$el);

    this.create = function (monitors) {

      var _severity = new SeveritySelect({ selected:'HIGH' });
      var _monitors = new MonitorSelect({
        collection : monitors.filter(function(m){
          return m.get('type') == 'scraper';
        })
      });

      _form.render();
      _form.find('form').prepend( _monitors.$el );
      _form.find('form [data-hook=advanced]').append( _severity.$el );

      _monitors.on('change',function(id){
        if (!id) {
          _form.reset();
        } else {
          var monitor = monitors.get(id).get('monitor');

          var config = (monitor.config||{});
          var data = _.extend(
            { name: monitor.name },
            monitor,
            (config.ps||config),
            monitors.get(id).attributes
          );

          _form.data = data;
        }
      });

      _modal.$el.on('click','button[data-hook=save]',function(){
        ScraperMonitorActions.create(_form.data);
      });
      _modal.show();
    };

    this.edit = function (scraper_id) {
      ScraperMonitorActions.get(scraper_id,function(error,scraper){

        _form.render({ model: scraper });

        var _severity = new SeveritySelect({
          selected: (scraper.get('failure_severity')||'HIGH').toUpperCase()
        });
        _form.find('form [data-hook=advanced]').append( _severity.$el );

        _modal.$el.on('click','button[data-hook=save]',function(){
          ScraperMonitorActions.update(scraper_id,_form.data);
        });
        _modal.show();
      });
    };

    return this;
  }

  function Task (options){
    var tasks = options.tasks,
      users = options.users,
      modal = new Modal({ title: 'API Request Task' });

    modal.render();

    var _scraper = new App.Models.Task();
    var _form = new Scraper.TaskFormView({
      model: _scraper,
      looptimes: window.Looptimes,
      timeouts: window.Timeouts,
      hosts: window.Hosts,
      tags: window.Tags,
      events: window.Events,
      users: users
    });
    _form.container = modal.queryByHook('container')[0];

    Object.defineProperty(this, 'form', {
      get: function(){ return _form; },
      enumerable: true
    });

    (function initializeModal($modal){
      $modal.on('shown.bs.modal', function(){
        _form.focus();
      });
      // once hide modal remove scraper form
      $modal.on('hidden.bs.modal', function(){
        _form.remove();
        $modal.off('click','button[data-hook=save]');
      });
    })(modal.$el);

    this.create = function () {
      _scraper.clear();
      // this is done every time , because the template is re-rendered every time
      var _tasks = new TaskSelect({
        collection : tasks.filter(function(m){
          return m.get('type') == 'scraper';
        })
      });
      _form.render();
      _form.find('form').prepend( _tasks.$el );

      _tasks.on('change',function(id){
        if (!id) {
          _form.reset();
        } else {
          var task = tasks.get(id);
          var attrs = task.attributes;
          _form.data = attrs;
        }
      });

      modal.$el.on('click','button[data-hook=save]',function(){
        var data = _form.data;
        TaskActions.create(data);
      });
      modal.show();
    };

    this.edit = function (scraper_id) {
      _scraper.clear();
      _scraper.set('id', scraper_id);
      _scraper.fetch({
        success:function(model, response, options){
          _form.render();

          modal.$el.on('click','button[data-hook=save]',function(){
            var data = _form.data;
            data.host_id = data.hosts;
            TaskActions.update(scraper_id,data);
          });

          modal.show();
        },
        error:function(model, response, options){
          bootbox.alert(response.responseText);
        }
      });
    };

    return this;
  }

  function Template (options){
    var _form = initializeForm( $(options.container)[0] );

    var _model = null ;
    var _tag = null ; // this is the tag in the group , is only set when edit

    Object.defineProperty(this, 'model', {
      get: function(){ return _model; },
      enumerable: true
    });

    Object.defineProperty(this, 'tag', {
      get: function(){ return _tag; },
      enumerable: true
    });

    Object.defineProperty(this, 'form', {
      get: function(){ return _form; },
      enumerable: true
    });

    var $scraperModal = $('[data-hook=scraper-monitor-modal]');
    (function initializeModal($modal){
      $scraperModal.on('shown.bs.modal', function(){ _form.focus(); });
      // once hide modal remove scraper form
      $scraperModal.on('hidden.bs.modal', function(){
        _form.remove();
        $scraperModal.off('click','button[data-hook=save]');
      });
    })($scraperModal);

    // start create
    this.openCreateForm = function(group){
      _tag = null ;
      _model = new App.Models.ScraperTemplate({ group: group });
      _form.render({ model: _model });
      $scraperModal.modal('show');
      return this;
    };

    // start edit
    this.openEditForm = function(group, tag){
      _tag = tag;
      var data = tag;
      _model = new App.Models.ScraperTemplate({
        id: data.id,
        group: group
      });
      _model.set( _model.parse({ monitor: data }) );
      _form.render({ model: _model });
      $scraperModal.modal('show');
      return this;
    };

    this.close = function(){
      $scraperModal.modal('hide');
    };

    this.persist = function(done){
      // var tag = _tag;
      var data = _form.data;
      _model.set(data);
      _model.save({},{
        success:function(model, response, options){
          done(null, {}, _tag);
        },
        error:function(model, response, options){
          bootbox.alert(response.responseText);
          //done(new Error('error'), {}, _tag);
        }
      });
    };

    return this;
  }

  return {
    TaskCRUD: Task,
    TemplateMonitorCRUD: Template,
    MonitorCRUD: Monitor
  }
})();
