var ScraperModal = new (function ScraperModal(){

  function initializeForm(container){
    // initialize a scraper form
    return new Scraper.FormView({
      container: container,
      looptimes: window.Looptimes,
      timeouts: window.Timeouts,
      hosts: window.Hosts,
      scraperHosts: window.ScraperHosts,
      tags: window.Tags,
    });
  }

  function getScraper(id,done){
    var scraper = new Model.Scraper({ id: id });
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

  this.MonitorCRUD = function(container){
    var _form = initializeForm(container);

    var $scraperModal = $('[data-hook=scraper-monitor-modal]');

    (function initializeModal($modal){
      $modal.on('shown.bs.modal', function(){
        _form.focus();
      });
      // once hide modal remove scraper form
      $modal.on('hidden.bs.modal', function(){
        _form.remove(); 
        $modal.off('click','button[data-hook=save]');
      });
    })($scraperModal);

    function setupModal (options){
      options||(options={});
      // once show modal render scraper form
      $scraperModal.modal('show');
      var clickFn = options.onClickSave||function(event){
        console.log('click event');
      }
      $scraperModal.on('click','button[data-hook=save]',clickFn);
    }

    function create () {
      var scraper = new Model.Scraper({});
      _form.render();
      setupModal({
        onClickSave:function(){
          var values = _form.values;
          scraper.set(values);
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
        }
      });
    }

    function edit (scraper_id) {
      getScraper(scraper_id,function(error,scraper){
        _form.render({ model: scraper });
        setupModal({
          onClickSave:function(){
            var values = _form.values;
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
          }
        });
      });
    }

    // on click create , render form
    function onClickCreate(event){
      event.preventDefault();
      event.stopPropagation();
      create();
    }
    // on click edit , fetch scraper and render form
    function onClickEdit(event){
      event.preventDefault();
      event.stopPropagation();
      var scraper_id = event.currentTarget.getAttribute('data-resource_id');
      edit(scraper_id);
    }

    $('.dropdown.resource [data-hook=create-scraper-monitor]').on('click',onClickCreate);
    $('.panel-group [data-hook=create-scraper-monitor]').on('click',onClickCreate);
    $('[data-hook=edit-scraper-monitor]').on('click',onClickEdit);
  }

  this.TemplateMonitorCRUD = function(options){

    var _form = initializeForm(options.container);

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
      _model = new Model.ScraperTemplate({
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
      _model = new Model.ScraperTemplate({
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
      var values = _form.values;
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
