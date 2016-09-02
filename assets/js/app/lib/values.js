function Values (values) {
  var _values = values;

  Object.defineProperty(this, 'values', {
    get: function(){
      return _values;
    },
    enumerable: true
  });

  function defineOwnValue (_this,name) {
    Object.defineProperty(_this, name, {
      get: function(){
        return _values[name];
      },
      enumerable: true
    });
  }

  for(var name in _values) defineOwnValue(this,name);
}

Values.prototype.toJSON = function() {
  return this.values;
}

Values.prototype.toString = function() {
  return JSON.stringify( this.values );
}

Values.prototype.serialize = function() {
  return $.param( this.values );
}

Values.prototype.toArray = function() {
  var array = [];
  for(var name in this.values){
    array.push({
      name: name,
      value: this.values[name]
    });
  }
  return array;
}
