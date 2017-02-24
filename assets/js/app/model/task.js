window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Task = BaseModel.extend({
  urlRoot:'/api/task',
  parse:function(task){
    var tags = [
      'task', 
      task.name,
      task.hostname,
      task.type
    ].concat( task.tags );

    return lodash.merge(task,{
      hosts: [ task.host_id ],
      formatted_tags: tags
    });
  },
  createClone:function(){
    var clone = this.clone();

    clone.unset('id');
    clone.unset('creation_date');
    clone.unset('last_update');
    clone.unset('_type');
    clone.unset('host');
    clone.unset('host_id');

    clone.save.apply(clone,arguments);
    return clone;
  }
});

window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Tasks = Backbone.Collection.extend({
  model: window.App.Models.Task,
  url:'/api/task',
});
