var debug = require('debug')('eye:controller:tasks');
var async = require('async');
var extend = require('util')._extend;

module.exports = {
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      tasks: function(callback) {
        supervisor.tasks(callback);
      },
      scripts: function(callback) {
        supervisor.scripts(callback);
      },
      hosts: function(callback) {
        supervisor.hosts(callback);
      },
      resources: function(callback) {
        supervisor.resources(callback);
      }
    }, function(err, data) {
      if (err) {
        return res.serverError("Error getting data from supervisor: " + err);
      }
      res.view(data);
    });
  },
  create: function(req, res)
  {
    var supervisor = req.supervisor;
    var params = req.params.all();

    if(!params.name) return res.send(400,'Name for the action is required');
    if(!params.script_id) return res.send(400,'Script is required');
    if(!params.hosts_id) return res.send(400,'Host is required');

    var data = extend(params,{
      'description': params.description || params.name,
      'script': params.script_id,
      'script_arguments': params.script_arguments.split(','),
      'hosts': params.hosts_id
    });

    supervisor.create({
      resource: supervisor.TASK,
      body: data,
      failure: error => res.send(500, error),
      success: task => res.json(task),
    });
  },
  /**
  *
  *
  */
  destroy : function(req, res) {
    var id = req.param("id", null);
    var supervisor = req.supervisor;

    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) )
      return res.send(400,'invalid id');
    else {
      supervisor.deleteTask(id, function(err){
        if (err) return res.send(500, err);
        res.send(200,"Task %s deleted".replace('%s',id));
      });
    }
  },
  get : function(req,res) {
    var supervisor = req.supervisor;
    var id = req.param("id", null);
    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) )
      return res.send(400,'invalid id');
    else
    {
      supervisor.task(id, function(err,task){
        if (err) return res.send(500, err);
        res.send(200,task);
      });
    }
  },
  /**
  *
  *
  */
  update: function(req, res) {
    var description = req.body.description || req.body.name;
    var id = req.param("id", null);
    var idHost = req.body.host_id;
    var idScript = req.body.script_id;
    var supervisor = req.supervisor;

    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) )
      return res.send(400,'invalid id');
    if( ! idHost ) return res.send(400,'select a host');
    if( ! idScript ) return res.send(400,'select a script');

    var updates = extend({
      'description': description,
      'host_id': idHost,
      'script_id': idScript,
      'resource_id': 0
    },req.body);

    supervisor.patchTask(id, updates, function(err, task) {
      if(err) return res.send(500, err);
      res.json(task);
    });
  }
};
