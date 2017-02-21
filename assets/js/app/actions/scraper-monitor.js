'use strict';

var ScraperMonitorActions = {
  create: function(data){
    var scraper = new App.Models.ScraperMonitor(data);
    scraper.save({},{
      success:function(model, response, options){
        bootbox.alert('Monitor Created',function(){
          window.location.reload();
        });
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  update: function(id,data){
    if (!id) return console.error('id is required');

    var scraper = new App.Models.ScraperMonitor({ id: id });
    scraper.set(data);
    scraper.save({},{
      success:function(model, response, options){
        bootbox.alert('Monitor Updated',function(){
          window.location.reload();
        });
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  remove: function(id){
    if (!id) return console.error('id is required');
  },
  get: function(id,next){
    if (!id) return console.error('id is required');

    var scraper = new App.Models.ScraperMonitor({ id: id });
    scraper.fetch({
      success:function(model, response, options){
        // on click render form
        next(null,scraper);
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
};
