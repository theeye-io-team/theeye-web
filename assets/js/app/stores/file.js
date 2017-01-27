'use strict';

var FilesStore = (function(){

  var files = new App.Collections.Files();

  function create (properties,source,next) {
    var file = new App.Models.File();
    file.set(properties);
    var source = btoa(unescape(encodeURIComponent(source)));
    file.set('file',source);
    file.upload({},{
      success: function(model, response, options){
        files.add(file);
        next(null,file);
      },
      error: function(model, response, options){
      }
    });
  }

  function update (id,properties,source,next) {
    var file = new App.Models.File({ id: id });
    file.set(properties);
    var source = btoa(unescape(encodeURIComponent(source)));
    file.set('file',source);

    file.upload({},{
      success: function(model, response, options){
        files.add([file],{merge:true});
        next(null,file);
      },
      error: function(model, response, options){
      }
    });
  }

  function remove (id,next) {
    //store.emitChange();
  }

  function get (id,next) {
    var model = files.get(id);
    if (!model) {
      var file = new App.Models.File({ id: id });
      file.fetch({
        success:function(model, response, options){
          files.add(file);
          next(null,file);
        },
        error:function(model, response, options){
          next(new Error(response));
        }
      });
    } else {
      next(null,model);
    }
  }

  function download (id,next) {
    var file = files.get({ id: id });
    file.download({
      success: function(model, response, options){
        next(null,file);
      },
      error: function(model, response, options){
        next(new Error(response));
      }
    });
  }

  files.fetch();

  var store = _.extend({},Backbone.Events,{
    /**
     *
     */
    emitChange: function(payload){
      this.trigger(App.Constants.CHANGE_EVENT,payload);
    },
    /**
     *
     */
    addChangeListener: function(callback,context) {
      this.on(App.Constants.CHANGE_EVENT, callback, context);
      return this;
    },
    /**
     *
     */
    removeChangeListener: function(callback) {
      this.off(App.Constants.CHANGE_EVENT, callback);
      return this;
    }
  });

  Object.defineProperty(store,'files',{
    get:function(){
      return files.clone();
    }
  });

  var id = window.App.Dispatcher.register(
    function (action) {

      var next = function(error,file){
        // if (error) handle error
        action.file = file;
        store.trigger(App.Constants.CHANGE_EVENT, action);
      }

      switch (action.actionType) {
        case App.Constants.FILE_CREATE:
          create(action.properties, action.source, next);
          break;
        case App.Constants.FILE_UPDATE:
          update(action.id, action.properties, action.source, next);
          break;
        case App.Constants.FILE_REMOVE:
          remove(action.id, next);
          break;
        case App.Constants.FILE_GET:
          get(action.id, next);
          break;
        case App.Constants.FILE_DOWNLOAD:
          download(action.id, next);
          break;
        default:
          // no op
      }
    }
  );

  return store;

})();
