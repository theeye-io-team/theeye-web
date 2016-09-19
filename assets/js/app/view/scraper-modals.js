var ScraperModal = new (function ScraperModal(){

  function initializeForm(container){
    // initialize a scraper form
    var view = new Scraper.FormView({
      looptimes: window.Looptimes,
      timeouts: window.Timeouts,
      hosts: window.Hosts,
      scraperHosts: window.ScraperHosts,
      tags: window.Tags,
    });
    view.targetEl = container;
    return view ;
  }

  function getScraper(id,done){
    var scraper = new App.Models.ScraperMonitor({ id: id });
    scraper.fetch({
      success:function(model, response, options){
        // on click render form
        done(null,scraper);
      },
      error:function(model, response, options){
        bootbox.alert('Error');
        done(new Error());
      }
    });
  }

  this.MonitorCRUD = function(formContainer){

    var _form = initializeForm( $(formContainer)[0] );

    Object.defineProperty(this, 'form', {
      get: function(){ return _form; },
      enumerable: true
    });

    var _$modal = $('[data-hook=scraper-monitor-modal]');

    (function initializeModal($modal){
      $modal.on('shown.bs.modal', function(){
        _form.focus();
      });
      // once hide modal remove scraper form
      $modal.on('hidden.bs.modal', function(){
        _form.remove(); 
        $modal.off('click','button[data-hook=save]');
      });
    })(_$modal);

    this.create = function () {
      var scraper = new App.Models.ScraperMonitor({});
      _form.render();
      _$modal.on('click','button[data-hook=save]',function(){
        var data = _form.data;
        scraper.set(data);
        scraper.save({},{
          success:function(model, response, options){
            bootbox.alert('Monitor Created',function(){
              window.location.reload();
            });
          },
          error:function(model, response, options){
            bootbox.alert(new Error('error'));
          }
        });
      });
      _$modal.modal('show');
    }

    this.edit = function (scraper_id) {
      getScraper(scraper_id,function(error,scraper){
        _form.render({ model: scraper });
        _$modal.on('click','button[data-hook=save]',function(){
          var values = _form.data;
          scraper.set(values);
          scraper.save({},{
            success:function(model, response, options){
              bootbox.alert('Monitor Updated',function(){
                window.location.reload();
              });
            },
            error:function(model, response, options){
              bootbox.alert('Error');
            }
          });
        });
        _$modal.modal('show');
      });
    }

    return this;
  }

  this.TaskCRUD = function(){
    var modal = new Modal({ title: 'API Request Task' });
    modal.render();

    var _scraper = new App.Models.ScraperTask();

    var _form = new Scraper.TaskFormView({
      model: _scraper,
      looptimes: window.Looptimes,
      timeouts: window.Timeouts,
      hosts: window.Hosts,
      scraperHosts: window.ScraperHosts,
      tags: window.Tags,
      events: window.Events
    });
    _form.targetEl = modal.queryByHook('container')[0];

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
    })( modal.$el );

    this.create = function () {
      _scraper.clear();
      // this is done every time , because the template is re-rendered every time
      _form.render();
      _form.find('[data-hook=name-container] label').html('Give it a name');
      _form.find('[data-hook=hosts-container] label').html('Where it has to run?');
      _form.find('[data-hook=looptime-container]').remove();

      modal.$el.on('click','button[data-hook=save]',function(){
        var data = _form.data;
        _scraper.set(data);
        _scraper.save({},{
          success:function(model, response, options){
            bootbox.alert('Task Created',function(){
              window.location.reload();
            });
          },
          error:function(model, response, options){
            bootbox.alert(new Error('error'));
          }
        });
      });
      modal.show();
    }

    this.edit = function (scraper_id) {
      _scraper.clear();
      _scraper.set('id', scraper_id);
      _scraper.fetch({
        success:function(model, response, options){
          _form.render();
          _form.find('[data-hook=name-container] label').html('Give it a name');
          _form.find('[data-hook=hosts-container] label').html('Where it has to run?');
          _form.find('[data-hook=looptime-container]').remove();

          modal.$el.on('click','button[data-hook=save]',function(){
            var values = _form.data;
            _scraper.set(values);
            _scraper.save({},{
              success:function(model, response, options){
                bootbox.alert('Task Updated',function(){
                  window.location.reload();
                });
              },
              error:function(model, response, options){
                bootbox.alert('Error');
              }
            });
          });

          modal.show();
        },
        error:function(model, response, options){
          bootbox.alert(arguments);
        }
      });
    }

    return this;
  }

  this.TemplateMonitorCRUD = function(options){

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
      _model = new App.Models.ScraperTemplate({
        group: group
      });
      _form.render({ model: _model });
      $scraperModal.modal('show');
      return this;
    }

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
    }

    this.close = function(){
      $scraperModal.modal('hide');
    }

    this.persist = function(done){
      var tag = _tag;
      var values = _form.data;
      _model.set(values);
      _model.save({},{
        success:function(model, response, options){
          done(null, {}, _tag);
        },
        error:function(model, response, options){
          done(new Error('error'), {}, _tag);
        }
      });
    }

    return this;
  }
})();
