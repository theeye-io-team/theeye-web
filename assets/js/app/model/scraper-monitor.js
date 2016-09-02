window.Model = window.Model || {};

window.Model.ScraperMonitor = Backbone.Model.extend({
  urlRoot:'/resource',
  parse:function(response){
    if(Array.isArray(response)){
      if(response.length>1){
        console.log('multiple responses');
        return {};
      } else {
        var monitor = response[0].monitor;
      }
    } else {
      var monitor = response.monitor || response.monitors[0];
    }

		var config = monitor.config;
		return {
      // monitor
			name : monitor.name,
			hosts : [ monitor.host_id ],
			looptime : monitor.looptime,
			type : monitor.type,
			tags : monitor.tags,
      // config
			body : config.body,
			external : config.external,
			external_host_id : config.external_host_id,
			gzip : config.gzip,
			json : config.json,
			method : config.method,
			pattern : config.pattern,
			resource_id : config.resource_id,
			status_code : config.status_code,
			timeout : config.timeout,
			url : config.url,
		};
  }
});
