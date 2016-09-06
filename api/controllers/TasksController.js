var debug = require('debug')('eye:controller:tasks');
var async = require('async');
var extend = require('util')._extend;

module.exports = {
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      tasks: (callback) => supervisor.tasks(callback),
      scripts: (callback) => supervisor.scripts(callback),
      hosts:(callback) => supervisor.hosts(callback),
      resources: (callback) => supervisor.resources(callback),
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
        res.json(200,'success');
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

    var updates = extend(params,{
      'description': params.description||params.name,
      'script': params.script_id,
      'hosts': params.hosts_id
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
    
    var data = extend(params,{
      'description': params.description || params.name,
      'script': params.script_id,
      'hosts': params.hosts_id||params.hosts
    });

    supervisor.create({
      route: supervisor.TASK,
      body: data,
      failure: error => res.send(500, error),
      success: task => res.json(task)
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
  },
  cancelSchedule: function(req, res) {
    console.log('CANCEL SCHEDULE');
    console.log(req.params);
    var supervisor = req.supervisor;
    var taskId = req.param("id", null);
    var scheduleId = req.param("scheduleId", null);
    if( ! taskId || ! taskId.match(/^[a-fA-F0-9]{24}$/) ) {
      return res.send(400,'invalid id');
    } else if (! scheduleId || ! scheduleId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.send(400,'invalid schedule id');
    } else {
      supervisor.remove({
        route: '/:customer/task',
        id: taskId,
        child: 'schedule/' + scheduleId,
        failure: error => res.send(500, error),
        success: task => res.json(task)
      });
      // supervisor.getTaskSchedule(id, function(err, scheduleData){
      //   if (err) return res.send(500, err);
      //   res.send(200, scheduleData);
      // });
    }

  }
};
