function Values (values) {
  var _values = values;

  this.toJSON = function() {
    return _values;
  }

  this.toString = function() {
    return JSON.stringify( _values );
  }

  this.serialize = function() {
    return $.param( _values );
  }

  this.toArray = function() {
    var array = [];
    for(var name in _values){
      array.push({ name: name, value: _values[name] });
    }
    return array;
  }

  Object.defineProperty(this, 'values', {
    get: function(){ return _values; },
    enumerable: true
  });

  function defineOwnValue (_this,name) {
    Object.defineProperty(_this, name, {
      get: function(){ return _values[name]; },
      enumerable: true
    });
  }

  for(var name in _values) defineOwnValue(this,name);
}
