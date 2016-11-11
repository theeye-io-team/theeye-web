'use strict';

window.App || ( window.App = {} );
window.App.Models || ( window.App.Models = {} );
window.App.Models.Monitor = Backbone.Model.extend({
  urlRoot:'/api/resource',
  parse:function(response){
    var resource = response.resource;
    var monitor = resource.monitor;
		return {
      // monitor
      acl : resource.acl,
			name : resource.name,
			hosts : [ resource.host_id ],
			type : resource.type,
			looptime : monitor.looptime,
			tags : monitor.tags
		};
  },
  initialize:function(){
  }
});

window.App.Collections || ( window.App.Collections = {} );
window.App.Collections.Monitors = Backbone.Collection.extend({
  model: window.App.Models.Monitor,
  url:'/api/resource'
});
