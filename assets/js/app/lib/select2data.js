var Select2Data = new (function Select2Data(){
  this.PrepareTags = function (tags) {
    if(!Array.isArray(tags)||tags.length==0) return [];
    return tags.map(function(tag){
      return { id: tag.name, text: tag.name };
    });
  }
  
  this.PrepareHosts = function (hosts){
    if(!Array.isArray(hosts)||hosts.length==0) return [];
    return hosts.map(function(host){
      return { id: host.id, text: host.hostname };
    });
  }

  this.PrepareScripts = function (scripts){
    if(!Array.isArray(scripts)||scripts.length==0) return [];
    return scripts.map(function(script){
      return { id: script.id, text: script.filename };
    });
  }

  this.PrepareIdValueData = function (data){
    if(!Array.isArray(data)||data.length==0) return [];
    return data.map(function(item){
      return { id: item.id, text: item.value };
    });
  }

  return this;
})();
