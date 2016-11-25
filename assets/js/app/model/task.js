window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Task = BaseModel.extend({
  urlRoot:'/api/task',
  parse:function(task){
    var tags = [
      'task', 
      (task.description||task.name),
      task.hostname,
      task.type
    ].concat( task.tags );

    return lodash.merge(task,{
      formatted_tags: tags
    });
  }
});

window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Tasks = Backbone.Collection.extend({
  model: window.App.Models.Task,
  url:'/api/task',
});
