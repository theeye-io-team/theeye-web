'use strict';

window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Monitor = BaseModel.extend({
  urlRoot:'/api/resource',
  parse:function(response){
    if (Array.isArray(response)) {
      response = response[0];
    }
    var resource = response.resource||response;
    var monitor = resource.monitor||response.monitor;

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
  createClone: function(props,options){
    var resource = this,
      monitor = this.attributes.monitor;
    var clone = new window.App.Models.Monitor();

    // flatten into clone attributes
    var config = monitor.config;
    if (config) {
      clone.set(config.ps||config);
    }

    if (resource.acl) {
      clone.set({'acl': resource.acl});
    }

    var properties = _.extend({},monitor,props,{
      _type:null,
      config:null,
      creation_date:null,
      id:null,
      last_update:null,
      resource:null,
      resource_id:null
    });

    clone.save(properties, options);
    return clone;
  }
});

var monitorStatePriority = {
  normal: 0,
  failure: 1,
  updates_stopped: 2,
  unknown: 3
}

window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Monitors = Backbone.Collection.extend({
  model: window.App.Models.Monitor,
  url:'/api/resource',
  comparator:function(model){
    return monitorStatePriority[model.get('state')];
  },
  /**
   * obtein a collection of every single tag.
   * @return {Backbone.Collection}
   */
  tagsUnique:function(){
    var tags = this.reduce(function(tags,monitor){
      monitor.get('tags').forEach(function(tag){
        if (tags.indexOf(tag)==-1) {
          tags.push(tag);
        }
      });
      return tags;
    },[]);

    return new Backbone.Collection(
      tags.map(function(t){
        return { name: t } ;
      })
    );
  }
});
