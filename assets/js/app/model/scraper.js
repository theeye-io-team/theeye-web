window.Model = window.Model || {};

window.Model.Scraper = Backbone.Model.extend({
  urlRoot:'/resource',
  parse:function(response){
    var monitor = response.monitor||response.monitors[0];
		var config = monitor.config;
		return {
			name : monitor.name,
			hosts : [ monitor.host_id ],
			looptime : monitor.looptime,
			type : monitor.type,
			tags : monitor.tags,
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
