var debug = require('debug')('eye:web:controller:resource');
var moment = require('moment');
var extend = require('util')._extend

var toBoolean = function(value){
  if(value==='true'||value===true)
    return true;
  if(value==='false'||value===false)
    return false;
  return null;
}

module.exports = {
  //////////////////////////////////MVC ACTIONS//////////////////////////////////
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      monitors: (callback) => supervisor.monitorFetch({},callback),
      scripts: (callback) => supervisor.scripts(callback),
      hosts: (callback) => supervisor.hosts(callback),
      resourceTypes: (callback) => supervisor.resourceTypes(callback),
      scraperHosts: (callback) => supervisor.scraperHosts(callback),
      tags: (callback) => supervisor.tags(callback)
    }, function(err, data) {
      if (err) return res.serverError("Error getting data from supervisor: " + err.toString());

      // milliseconds
      data.looptimes = [
        {'id':'15000','value':'0.25'},
        {'id':'30000','value':'0.5'},
        {'id':'60000','value':'1'},
        {'id':'300000','value':'5'},
        {'id':'900000','value':'15'}
      ];
      // milliseconds
      data.timeouts = [
        {'id':5000, 'value':5},
        {'id':10000, 'value':10},
        {'id':15000, 'value':15},
      ];
      data.moment = moment;
      res.view(data);
    });
  },
  ////////////////////////////////REST ENDPOINTS////////////////////////////////
  /**
   * Remove resource
   * DEL /resource
   */
  destroy : function(req, res,next) {
    var supervisor = req.supervisor;
    var id = req.param("id",null);
    if( !id || !id.match(/^[a-fA-F0-9]{24}$/) ) {
      return res.send(400,'invalid id');
    } else {
      supervisor.deleteResource( id, function(err){
        if (err) return res.send(500, err);
        res.send(200,"Resource %s deleted".replace('%s',id));
      });
    }
  },
  /**
   * Create resource
   * POST /resource
   */
  create : function(req,res,next)
  {
    var supervisor = req.supervisor;
    var params = req.params.all();

    var hosts = params.hosts_id || params.hosts || params.host_id ;
    if( ! hosts ) res.send(400, 'At least one host is required');
    hosts = ( ! Array.isArray(hosts) ) ? [ hosts ] : hosts;

    var type = params.monitor_type || params.type;
    if( !type ) return res.send(400,"No resource type supplied");

    var data = extend(params, { hosts: hosts, type: type });
    if( params.script_arguments ){
      data.script_arguments = params.script_arguments
        .split(',')
        .map(arg => arg.trim());
    }

    supervisor.create({
      route: supervisor.RESOURCE,
      body: data,
      failure: error => res.send(500, error),
      success: monitors => res.json(monitors),
    });
  },
  /**
   * Edit resource
   * PUT /resource
   */
  update : function(req,res,next)
  {
    var supervisor = req.supervisor;
    var params = req.params.all();

    var host = params.hosts_id ||  params.hosts || params.host_id;
    if( ! host ) return res.send(400,'the host is required');
    host = (Array.isArray(host) ? host[0] : host);

    var type = params.monitor_type || params.type;
    if( ! type ) return res.send(400,'No resource type supplied');

    var data = extend(params, { host_id: host, type: type });
    if( params.script_arguments ){
      data.script_arguments = params.script_arguments
        .split(',')
        .map(arg => arg.trim());
    }

    supervisor.patch({
      id: params.id,
      route: supervisor.RESOURCE,
      body: data,
      failure: error => res.send(500, error),
      success: resource => res.json(resource),
    });
  },
  /**
   * Get resource
   * GET /resource
   */
  get: function(req,res)
  {
    var supervisor = req.supervisor;
    var id = req.param("id", null);

    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) ) return res.send(400,'invalid id');

    async.parallel({
      resource: function(callback){
        debug('fetching resource');
        supervisor.resource( id, callback )
      },
      monitor: function(callback){
        debug('fetching monitors');
        supervisor.monitorFetch({ 'resource': id }, callback);
      }
    },function(err, data){
      if(err) return res.send(500, err);
      res.send(200,{ resource: data.resource, monitors: data.monitor });
    });
  },
  updateAlerts: function(req,res) {
    var supervisor = req.supervisor;
    var id = req.param("id", null);
    var value = toBoolean(req.param('enable'));

    if(value===null){
      return res.send(400,'invalid alerts value');
    }

    var data = { 'alerts': value.toString() };
    supervisor.patch({
      id: req.params.id,
      route: supervisor.RESOURCE,
      child: 'alerts',
      body: data,
      failure: error => res.send(500, error),
      success: resource => res.send(200,{ resource: resource })
    });
  }
};
