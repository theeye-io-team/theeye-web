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
  }
};
