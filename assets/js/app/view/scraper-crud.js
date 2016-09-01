var ScraperMonitorCRUD = function(){
  // initialize a scraper form
  var scraperForm = new Scraper.FormView({
    container: '[data-hook=scraper-form-container]',
    looptimes: window.Looptimes,
    timeouts: window.Timeouts,
    hosts: window.Hosts,
    scraperHosts: window.ScraperHosts,
    tags: window.Tags,
  });

  window.form = scraperForm;

  var $scraperModal = $('[data-hook=scraper-resource-modal]');
  $scraperModal.on('shown.bs.modal', function(){ scraperForm.focus(); });
  // once hide modal remove scraper form
  $scraperModal.on('hidden.bs.modal', function(){
    scraperForm.remove(); 
    $scraperModal.off('click','button[data-hook=save]');
  });

  function setupModal (options){
    options||(options={});
    // once show modal render scraper form
    $scraperModal.modal('show');

    var clickFn = options.onClickSave||function(event){ console.log('click event'); }
    $scraperModal.on('click','button[data-hook=save]',clickFn);
  }

  function create (event) {
    event.preventDefault();
    event.stopPropagation();

    var scraper = new Model.Scraper({});
    // on click create render form
    scraperForm.render();
    setupModal({
      onClickSave:function(){
        var values = scraperForm.values;
        scraper.set(values);
        scraper.save({},{
          success:function(model, response, options){
            bootbox.alert('Monitor Created',function(){
              window.location.reload();
            });
          },
          error:function(model, response, options){
            bootbox.alert('Error');
          }
        });
      }
    });
  } 
  function edit (event) {
    event.preventDefault();
    event.stopPropagation();

    var scraper_id = event.currentTarget.getAttribute('data-resource_id');
    var scraper = new Model.Scraper({ id: scraper_id });
    scraper.fetch({
      success:function(model, response, options){
        // on click render form
        scraperForm.render({ model: scraper });
        setupModal({
          onClickSave:function(){
            var values = scraperForm.values;
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
      },
      error:function(model, response, options){
        bootbox.alert('Error');
      }
    });
  }

  $('.dropdown.resource [data-hook=create-scraper-monitor]').on('click',create);
  $('.panel-group [data-hook=create-scraper-monitor]').on('click',create);
  $('[data-hook=edit-scraper-monitor]').on('click',edit);
}
