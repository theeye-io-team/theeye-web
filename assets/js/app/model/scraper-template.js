window.App = window.App || {};
window.App.Models = window.App.Models || {};

window.App.Models.ScraperTemplate = BaseModel.extend({
  initialize:function(options){
    this.group = options.group;
    this.isTemplate = true;
  },
  urlRoot: '/admin/hostgroup/:group/monitortemplate',
  url:function(){
    var url = this.urlRoot.replace(':group', this.group);
    if( this.isNew() ) return url;
    else return url + '/' + this.id;
  },
  parse:function(response){
    var monitor = response.monitor||response.monitors[0];
		var config = monitor.config? monitor.config:monitor;
		return {
      // monitor
			name : monitor.name,
			hosts : [ monitor.host_id ],
			looptime : monitor.looptime,
			type : monitor.type,
			tags : monitor.tags,
      // config
			body : config.body,
			gzip : config.gzip,
			json : config.json,
			method : config.method,
			pattern : config.pattern,
			resource_id : config.resource_id,
			status_code : config.status_code,
			timeout : config.timeout,
			url : config.url,
		};
  },
  serializeArray:function(){
    var attrs = this.attributes;

    return Object.keys(attrs)
    .map(function(key){
      //if( key == 'name' ){
      //  return { 'name': 'description', 'value': attrs[key] };
      //}
      return { 'name': key, 'value': attrs[key] };
    });
  }
});
