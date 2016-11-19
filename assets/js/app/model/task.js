window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Task = BaseModel.extend({
  urlRoot:'/api/task',
});

window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Tasks = Backbone.Collection.extend({
  model: window.App.Models.Task,
  url:'/api/task',
});
