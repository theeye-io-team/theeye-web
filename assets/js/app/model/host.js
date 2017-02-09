'use strict';

window.App||(window.App={});
window.App.Models||(window.App.Models={});
window.App.Models.Host = BaseModel.extend({
  urlRoot:'/api/host'
});

window.App.Collections||(window.App.Collections={});
window.App.Collections.Hosts = Backbone.Collection.extend({
  model: window.App.Models.Host,
  url:'/api/host',
  comparator:function(model){
    return model.get('hostname');
  }
});
