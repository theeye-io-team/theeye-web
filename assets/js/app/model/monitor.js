'use strict';

window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Monitor = BaseModel.extend({
  urlRoot:'/api/resource',
  parse:function(response){
    var resource = response;
    var monitor = resource.monitor;

    var last_update_formated = moment(resource.last_update)
      .startOf('second')
      .fromNow();

    var tags = [
      'monitor', 
      (resource.description||resource.name),
      resource.hostname,
      resource.type,
      resource.state,
    ].concat( monitor.tags );

    return lodash.merge(resource,{
      // monitor
      hosts: [ resource.host_id ],
      looptime: monitor.looptime,
      tags: monitor.tags,
      formatted_tags: tags,
      last_update_formated: last_update_formated
    });
  },
  initialize:function(){
  }
});

window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Monitors = Backbone.Collection.extend({
  model: window.App.Models.Monitor,
  url:'/api/resource',
});
