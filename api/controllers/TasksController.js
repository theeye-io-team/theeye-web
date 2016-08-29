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
      },
      tags: callback => supervisor.tags(callback)
    }, function(err, data) {
      if (err) return res.serverError("Error getting data from supervisor: " + err.toString());

      res.view(data);
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
    else {
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
    var supervisor = req.supervisor;

    var params = req.params.all();
    var id = params.id;

    if( !id || !id.match(/^[a-fA-F0-9]{24}$/) ) return res.send(400,'invalid id');
    if( !params.host_id ) return res.send(400,'select a host');
    if( !params.script_id ) return res.send(400,'select a script');

    var updates = extend(params,{
      'description': params.description || params.name,
      'script_arguments': params.script_arguments.split(',')
    });

    supervisor.patch({
      route: supervisor.TASK,
      id: id,
      body: updates,
      failure: error => res.send(500, error),
      success: task => res.json(task)
    });
  },
  /**
   *
   *
   */
  create: function(req, res) {
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
      route: supervisor.TASK,
      body: data,
      failure: error => res.send(500, error),
      success: task => res.json(task),
    });
  },
  // POST
  schedule: function(req,res) {
    var supervisor = req.supervisor;

    supervisor.create({
      route: supervisor.TASK + '/schedule',
      body: req.body,
      failure: error => res.send(500, error),
      success: task => res.json(task)
    });
  },
  // GET
  getSchedule: function(req, res) {
    var supervisor = req.supervisor;
    var id = req.param("id", null);
    if( ! id || ! id.match(/^[a-fA-F0-9]{24}$/) )
      return res.send(400,'invalid id');
    else {
      supervisor.getTaskSchedule(id, function(err, scheduleData){
        if (err) return res.send(500, err);
        res.send(200, scheduleData);
      });
    }
  }
};
