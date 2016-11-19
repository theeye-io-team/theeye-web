window.App = window.App || {};
window.App.Models = window.App.Models || {};

window.App.Models.ScraperMonitor = BaseModel.extend({
  urlRoot:'/resource',
  parse:function(resource){
    if (Array.isArray(resource)) {
      console.warn('multiple resources');
      return {};
    }

    var monitor = resource.monitor;
    if (!monitor) return {};

		var config = monitor.config;

		return {
      // monitor
      acl: resource.acl,
			name: monitor.name,
			hosts: [ monitor.host_id ],
			looptime: monitor.looptime,
			type: monitor.type,
			tags: monitor.tags,
      // config
			body: config.body,
			gzip: config.gzip,
			json: config.json,
			method: config.method,
			pattern: config.pattern,
			resource_id: config.resource_id,
			status_code: config.status_code,
			timeout: config.timeout,
			url: config.url,
		};
  }
});
