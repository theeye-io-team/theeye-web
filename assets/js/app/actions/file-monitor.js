'use strict';

var FileActions = {
  create: function(data,source){
    App.Dispatcher.dispatch({
      actionType: App.Constants.FILE_CREATE,
      properties: data,
      source: source
    });
  },
  update: function(id,data,source){
    App.Dispatcher.dispatch({
      actionType: App.Constants.FILE_UPDATE,
      id: id,
      properties: data,
      source: source
    });
  },
  remove: function(id){
    App.Dispatcher.dispatch({
      actionType: App.Constants.FILE_REMOVE,
      id: id
    });
  },
  get: function(id){
    if (!id) {
      console.error('id is required');
      return;
    }
    App.Dispatcher.dispatch({
      actionType: App.Constants.FILE_GET,
      id: id
    });
  },
  download: function(id){
    if (!id) {
      console.error('id is required');
      return;
    }
    App.Dispatcher.dispatch({
      actionType: App.Constants.FILE_DOWNLOAD,
      id: id
    });
  }
};
