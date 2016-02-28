
module.exports = {
  validate: function(type, input){
    var data={};

    switch(type) {
      case 'scraper': data = new Scraper(input); break;
      case 'process': data = new Process(input); break;
      case 'script': data = new Script(input); break;
      case 'dstat': data = new Dstat(input); break;
      default: 
        var message = 'invalid resource type "' + type + '" supplied';
        data.error = [{ 'description' : message }];
        break;
    }
    return data;
  }
}


function Dstat(input){
  var data = { monitor_type:'dstat' };

  if(typeof input.cpu != 'undefined') data.cpu = input.cpu;
  if(typeof input.mem != 'undefined') data.mem = input.mem;
  if(typeof input.cache != 'undefined') data.cache = input.cache;
  if(typeof input.disk != 'undefined') data.disk = input.disk;

  return data;
}

//filter and validate the post/put process resource params
function Process(input)
{
  var errors = [];
  var data = {
    description: input.description,
    looptime: input.looptime,
    pattern: input.pattern,
    monitor_type: input.monitor_type,
    name: input.name,
    enable: input.enable || 'true',
  };

  // validate
  if(!data.description) errors.push({param : 'description', description: 'Description is required'});
  if(!data.looptime) errors.push({param : 'looptime', description: 'Check interval is required'}); 
  if(!data.pattern) errors.push({param : 'pattern', description: 'Search pattern is required'});

  // filter
  //if(!data.psargs)       data.psargs = 'aux';
  if(!data.monitor_type) data.monitor_type = 'process';
  if(!data.name) data.name = data.description.toLowerCase().replace(/\s+/g, '_');

  if(errors.length > 0) return {error : errors};
  else return data;
}

//filter and validate the post/put scraper resource params
function Scraper(input)
{
  var errors = [];
  var data = {
    external_host_id: input.external_host_id,
    description: input.description,
    looptime: input.looptime,
    url: input.url,
    pattern: input.pattern,
    timeout: input.timeout,
    monitor_type: input.monitor_type,
    name: input.name,
    enable: input.enable || 'true',
  };

  // validate
  if(!data.description) errors.push({param : 'description', description: 'Description is required'});
  if(!data.looptime) errors.push({param : 'looptime', description: 'Check interval is required'}); 
  if(!data.url) errors.push({param : 'url', description: 'URL is required'});
  if(!data.pattern) errors.push({param : 'pattern', description: 'Pattern is required'});
  if(!data.timeout) errors.push({param : 'timeout', description: 'Timeout is required'});

  // filter
  if(!data.monitor_type) data.monitor_type = 'scraper';    
  if(!data.name) data.name = data.description.toLowerCase().replace(/\s+/g, '_');

  if(errors.length > 0) return {error : errors};
  else return data;
}

//filter and validate the post/put script resource params
function Script(input)
{
  var errors = [];
  var data = {
    description: input.description,
    looptime: input.looptime,
    script_id: input.script_id,
    script_arguments: input.script_arguments,
    monitor_type: input.monitor_type,
    enable: input.enable || 'false',
    name: input.name
  };

  //validate
  if(!data.description) errors.push({param: 'description', description: 'Description is required'});
  if(!data.looptime) errors.push({param: 'looptime', description: 'Check interval is required'}); 
  if(!data.script_id) errors.push({param: 'script_id', description: 'Script required'});

  //filter
  if(!data.monitor_type) data.monitor_type = 'script';    
  if(!data.name) data.name = data.description.toLowerCase().replace(/\s+/g, '_');

  if(errors.length > 0) return {error : errors};
  else return data;
}
