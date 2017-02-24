'use strict';

var MonitorActions = {
  create: function(data){
    var scraper = new App.Models.Monitor(data);
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

    var monitor = new App.Models.Monitor({ id: id });
    monitor.set(data);
    monitor.save({},{
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
  remove: function(id,done){
    if (!id) return console.error('id is required');
    var monitor = new App.Models.Monitor({ id: id });
    monitor.destroy({
      success:function(model, response, options){
        if (done) return done();
        bootbox.alert('Monitor Removed',function(){
          window.location.reload();
        });
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  get: function(id){
    if (!id) return console.error('id is required');
  }
};

