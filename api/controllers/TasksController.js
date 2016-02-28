/**
 * TasksController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var debug = require("debug")("eye:controller:tasks");
var async = require("async");
module.exports = {
  /**
  *
  *
  */
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
  /**
  *
  *
  */
  create: function(req, res)
  {
    var description = req.body.description || req.body.name;
    var supervisor = req.supervisor;

    if (!req.body.name) return res.send(400, "Name for the action is required");
    if (!req.body.script_id) return res.send(400, "Script is required");
    if (!req.body.hosts_id && !req.body.resource_id) 
      return res.send(400, "Host or Resource is required");

    var hosts = req.body.hosts_id;

    supervisor.createTask({
      name: req.body.name,
      description: description,
      hosts_id: hosts,
      target: req.body.target,
      script_id: req.body.script_id,
      script_arguments: req.body.script_arguments,
      resource_id: req.body.resource_id
    }, function(err, task) {
      if (err) {
        return res.send(500, err.toString());
      }
      res.json(task);
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

    var updates = {
      name: req.body.name,
      description: description,
      host_id: idHost,
      script_id: idScript,
      script_arguments: req.body.script_arguments,
      resource_id: req.body.resource_id || 0
    };

    supervisor.patchTask(id, updates, function(err, task) {
      if(err) return res.send(500, err);
      res.json(task);
    });
  }
};
