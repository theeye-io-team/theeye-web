'use strict';

window.App||(window.App={});
window.App.Models||(window.App.Models={});
window.App.Models.File = BaseModel.extend({
  urlRoot:'/api/file',
  upload:function(data,options){
    var data = this.attributes;
    var formData = new FormData();
    for (var key in data) formData.append(key,data[key]);

    jQuery.ajax({
      url: this.urlRoot,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST'
    }).done(options.success).fail(options.error);
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

