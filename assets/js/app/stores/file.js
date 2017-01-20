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
    /**
    var file = new App.Models.File();
    file.set(properties);
    var source = btoa(unescape(encodeURIComponent(source)));
    file.set('file',source);
    file.upload({},{
      success: function(model, response, options){
      },
      error: function(model, response, options){
      }
    });
    */
  }

  function remove (id,next) {
    //store.emitChange();
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
        default:
          // no op
      }
    }
  );

  return store;

})();
