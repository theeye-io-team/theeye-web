window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Monitor = Backbone.Model.extend({
  urlRoot:'/api/resource',
  parse:function(response){
    return response;
  },
  initialize:function(){
  }
});

window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Monitors = Backbone.Collection.extend({
  model: window.App.Models.Monitor,
  url:'/api/resource'
});
