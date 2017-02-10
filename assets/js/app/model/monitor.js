'use strict';

// please do not use global
var stateIcons = {
  unknown         : "icon-nonsense",
  normal          : "icon-check",
  low             : "icon-info", /* failure state */
  high            : "icon-warn", /* failure state */
  critical        : "icon-fatal", /* failure state */
  failure         : "icon-fatal", /* failure state */
  updates_stopped : "icon-error",
  getIcon: function (state) {
    var icon = (this[state.toLowerCase()]||this.unknown);
    return icon;
  },
  indexOf: function (value) {
    // keep the indexes in order !
    return [
      "unknown",
      "normal",
      "low",
      "high",
      "critical",
      "failure", // when failure_severity is not set use failure
      "updates_stopped"
    ].indexOf(value);
  },
  classToState: function (iconClass) {
    var self = this;
    var elems = Object.keys(self).filter(function(state){
      if (self[state]==iconClass) return state;
    });
    return elems[0];
  },
  filterAlertIconClasses: function(iconClasses) {
    var failureClasses = ['icon-info','icon-warn','icon-fatal'],
      filtered = iconClasses.filter(function(idx,icon){
        return failureClasses.indexOf(icon) != -1
      });
    return filtered;
  }
};

window.App||(window.App={});
window.App.Models||(window.App.Models={});
window.App.Models.Monitor = BaseModel.extend({
  urlRoot: '/api/resource',
  initialize: function(options){
    Object.defineProperty(this,'state_severity',{
      get:function(){
        return this.stateSeverity();
      }
    });
    Object.defineProperty(this,'formatted_last_update',{
      get:function(){
        return moment(this.get('last_update'))
          .format('MMMM Do YYYY, h:mm:ss a');
      }
    });
  },
  parse: function(response){
    if (Array.isArray(response)) {
      if (response.length===0) return {};
      response = response[0];
    }
    var resource = (response.resource||response);
    var monitor = (resource.monitor||response.monitor);

    if (!monitor) return resource;

    var last_update_formated = moment(resource.last_update)
      .startOf('second')
      .fromNow();

    var tags = [
      'monitor', 
      resource.name,
      resource.hostname,
      resource.type,
      resource.state,
      resource.failure_severity,
    ].concat(monitor.tags);

    return lodash.merge(resource,{
      // monitor
      hosts: [ resource.host_id ],
      looptime: monitor.looptime,
      tags: monitor.tags,
      formatted_tags: tags,
      last_update_formated: last_update_formated
    });
  },
  /**
   * Based on resource state and its failure severity returns its severity state
   * If the resource is failing, resturns the failure severity instead.
   * @return String
   */
  stateSeverity: function(){
    var state = this.get('state');
    var severity = this.get('failure_severity');

    if (state==='failure') {
      if (!severity) return 'failure';
      else return severity.toLowerCase();
    } else {
      return state.toLowerCase();
    }
  },
  stateOrder: function(){
    return stateIcons.indexOf(this.stateSeverity());
  },
  stateIcon: function(){
    return stateIcons[this.stateSeverity()];
  },
  hasError: function(){
    return this.isFailing()||this.isNotReporting();
  },
  isFailing: function(){
    return this.get('state')==='failure';
  },
  isNotReporting: function(){
    return this.get('state')==='updates_stopped';
  },
  submonitorsWithError: function(){
    var submons = this.get('submonitors');
    if (!submons) return null;
    return submons.filter(function(monitor){
      return monitor.hasError();
    }).length > 0;
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

window.App.Models.FileMonitor = window.App.Models.Monitor.extend({
  parse:function(response){
    var parsed = window.App.Models.Monitor.prototype.parse.apply(this,arguments);
    if (!response.monitor) return;
    return lodash.merge(parsed,response.monitor.config);
  }
});

window.App.Collections||(window.App.Collections={});
window.App.Collections.Monitors = Backbone.Collection.extend({
  model: window.App.Models.Monitor,
  url:'/api/resource',
  comparator:function(model){
    return model.stateOrder();
  },
  /**
   * obtein a collection of every single tag.
   * @return {Backbone.Collection}
   */
  tagsUnique:function(){
    var tags = this.reduce(function(tags,monitor){
      monitor.get('formatted_tags').forEach(function(tag){
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
