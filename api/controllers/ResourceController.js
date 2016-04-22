var debug = require('debug')('eye:web:controller:resource');
var resource = require('../services/resource');
var moment = require('moment');

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
      monitors: function(callback) {
        supervisor.monitorFetch({},callback);
      },
      scripts: function(callback) {
        supervisor.scripts(callback);
      },
      hosts: function(callback) {
        supervisor.hosts(callback);
      },
      resourceTypes: function(callback) {
        supervisor.resourceTypes(callback);
      },
      scraperHosts: function(callback) {
        supervisor.scraperHosts(callback);
      }
    }, function(err, data) {
      if (err) {
        console.log(err.toString());
        return res.serverError("Error getting data from supervisor: " + err.toString());
      }
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
    var params = req.params.all();
    var supervisor = req.supervisor;

    if( !req.body.host_id && !req.body.hosts_id )
      return res.send(400, 'At least one host is required');
    if( !req.body.monitor_type )
      return res.send(400,"No resource type supplied");

    var data = resource.validate(req.body.monitor_type, params);

    //for now return only the first error to avoid refactor
    if(data.error) return res.send(400, data.error[0].description);

    data.type = req.params.type;
    data.hosts = [];
    var hostId = req.body.host_id;
    var hostsId = req.body.hosts_id;

    if(!hostsId) data.hosts.push(hostId);
    else data.hosts = hostsId;

    supervisor.createResource( data, function(err, resource) {
      if(err) return res.send(500, err);
      res.send(201,{ resource: resource });
    });
  },
  /**
   * Edit resource
   * PUT /resource
   */
  update : function(req,res,next)
  {
    var params = req.params.all();
    var supervisor = req.supervisor;

    var id = req.param("id", null);
    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) )
      return res.send(400,'invalid id');
    if( !req.body.monitor_type )
      return res.send(400,"No resource type supplied");

    var data = resource.validate(req.body.monitor_type, params);

    //for now return only the first error to avoid refactor
    if(data.error) return res.send(400, data.error[0].description);

    var hostsId = req.body.hosts_id;
    if( hostsId && !(hostsId instanceof Array) ) data.host = hostsId;
    else if(hostsId instanceof Array && hostsId.length==1) data.host = hostsId[0];
    else return res.send(400,'Host parameter error');

    supervisor.patchResource(
      req.params.id,
      data,
      function(err, resource) {
        if(err) return res.send(500, err);
        res.send(200,{ resource: resource });
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
    var type = req.param("monitor_type", null);

    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) ) return res.send(400,'invalid id');
    if( ! type )  return res.send(400,'monitor type is required');

    async.parallel({
      resource: function(callback){
        debug('fetching resource');
        supervisor.resource( id, callback )
      },
      monitor: function(callback){
        debug('fetching monitors');
        supervisor.monitorFetch({ 'resource': id, 'type': type }, callback );
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
    supervisor.patchResource(
      req.params.id,
      data,
      function(err, resource) {
        if(err) return res.send(500, err);
        res.send(200,{ resource: resource });
      }
    );
  }
};
