'use strict';

(function Dispatcher(){

  window.App||(window.App={});

  var _prefix = 'ID_';

  var Dispatcher = function(){
    if (!this instanceof Dispatcher) {
      return new Dispatcher();
    }

    _.extend(this, Backbone.Events);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * https://github.com/facebook/flux/blob/master/src/Dispatcher.js
   */
  Dispatcher.prototype = {
    _startDispatching: function (payload) {
      for (var id in this._callbacks) {
        this._isPending[id] = false;
        this._isHandled[id] = false;
      }
      this._pendingPayload = payload;
      this._isDispatching = true;
    },
    _stopDispatching: function() {
      delete this._pendingPayload;
      this._isDispatching = false;
    },
    _invokeCallback: function(id) {
      this._isPending[id] = true;
      this._callbacks[id](this._pendingPayload);
      this._isHandled[id] = true;
    },
    dispatch: function(payload) {
      if (this._isDispatching) {
        var msg = 'Dispatcher.dispatch(...): Cannot dispatch in the middle of a dispatch.';
        throw new Error(msg);
      }

      this._startDispatching(payload);

      try {
        for (var id in this._callbacks) {
          if (this._isPending[id]) {
            continue;
          }
          this._invokeCallback(id);
        }
      } finally {
        this._stopDispatching();
      }
    },
    isDispatching: function() {
      return this._isDispatching;
    },
    register: function(callback){
      var id = _prefix + this._lastID++;
      this._callbacks[id] = callback;
      return id;
    },
    unregister: function(id) {
      delete this._callbacks[id];
    }
  }

  window.App.Dispatcher = new Dispatcher();

})();
