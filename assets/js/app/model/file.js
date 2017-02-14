'use strict';

window.App||(window.App={});
window.App.Models||(window.App.Models={});
window.App.Models.File = BaseModel.extend({
  urlRoot:'/api/file',
  encodeSource:function(str){
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  },
  decodeSource:function(str){
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  },
  parse:function(data){
    if (data.file) {
      data.file = this.decodeSource(data.file);
    }
    return data;
  },
  upload:function(data,options){
    var self = this;
    options||(options={});
    var method, url, SOURCE_KEY = 'source';
    var data = this.attributes;
    var formData = new FormData();

    for (var key in data) {
      if (key!==SOURCE_KEY) {
        formData.append(key,data[key]);
      } else {
        var source = data[SOURCE_KEY];
        var file = this.encodeSource(source);
        formData.append(key,file);
      }
    }

    if (this.isNew()===true) {
      url = this.urlRoot;
      method = 'POST';
    } else {
      url = this.urlRoot + '/' + this.get('id');
      method = 'PUT';
    }

    jQuery.ajax({
      url: url,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      type: method,
    }).done(function(data,status,jqxhr){
      var parsed = self.parse(data)
      self.set(parsed);
      if (options.success) {
        options.success(self,jqxhr,options);
      }
    }).fail(function(jqxhr,textStatus,errorThrown){
      console.log(arguments);
      if (options.error) {
        options.error(self,jqxhr,options);
      }
    });
  },
  download:function(options){
    var self = this;
    options||(options={});
    jQuery.ajax({
      url: this.urlRoot + '/' + this.get('id'),
      type: 'GET'
    }).done(function(data,status,jqxhr){
      var parsed = self.parse(data)
      self.set(parsed);
      if (options.success) {
        options.success(self,jqxhr,options);
      }
    }).fail(function(jqXHR,textStatus,errorThrown){
      console.log(arguments);
      if (options.error) {
        options.error(self,jqxhr,options);
      }
    });
  }
});

window.App.Collections||(window.App.Collections={});
window.App.Collections.Files = Backbone.Collection.extend({
  model: window.App.Models.File,
  url:'/api/file',
  comparator:function(model){
    return model.get('name');
  }
});

