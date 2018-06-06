'use strict';

window.App = window.App || {};
window.App.Models = window.App.Models || {};
window.App.Models.ScraperMonitor = BaseModel.extend({
  urlRoot:'/resource',
  parse:function(resource){
    if (Array.isArray(resource)) {
      console.warn('multiple resources');
      return {};
    }

    const monitor = resource.monitor;
    if (!monitor || typeof monitor !== 'object') return {}

		const config = monitor.config;
    if (!config) return {}

		return {
      // monitor
      acl: resource.acl,
			name: monitor.name,
      description: resource.description,
			hosts: [ monitor.host_id ],
			looptime: monitor.looptime,
			type: monitor.type,
			tags: monitor.tags,
      failure_severity: resource.failure_severity,
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
