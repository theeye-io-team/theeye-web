'use strict';

var TaskActions = {
  create: function(data){
    var task = new App.Models.Task(data);
    task.save({},{
      success: function(model, response, options){
        bootbox.alert('Task Created',function(){
          window.location.reload();
        });
      },
      error: function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  update: function(id,data){
    if (!id) return console.error('id is required');
    var task = new App.Models.Task({ id: id });
    task.set(data);
    task.save({},{
      success: function(model, response, options){
        bootbox.alert('Task Updated',function(){
          window.location.reload();
        });
      },
      error: function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
  remove: function(id,done){
    if (!id) return console.error('id is required');
    var task = new App.Models.Task({ id: id });
    task.destroy({
      success:function(model, response, options){
        if (done) return done();
        bootbox.alert('Task Removed',function(){
          window.location.reload();
        });
      },
      error:function(model, response, options){
        new ServerError(response.responseJSON);
      }
    });
  },
};

