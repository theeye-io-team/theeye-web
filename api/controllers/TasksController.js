var debug = require('debug')('eye:controller:tasks');
var async = require('async');
var extend = require('util')._extend;

module.exports = {
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      tasks: (callback) => supervisor.tasks(callback),
      scripts: (callback) => supervisor.scripts(callback),
      hosts: (callback) => supervisor.hosts(callback),
      resources: (callback) => supervisor.fetch({
        route: supervisor.RESOURCE,
        success: (body) => callback(null, body),
        failure: (err) => callback(err)
      }),
      tags: (callback) => supervisor.tags(callback),
      events: (callback) => supervisor.fetch({
        route: supervisor.EVENTS,
        success: (body) => callback(null, body),
        failure: (err) => callback(err)
      })
    }, function(err, data) {
      if (err) return res.serverError("Error getting data from supervisor: " + err.toString());

      // milliseconds
      function minutesToMillisecondsString(mins){
        return String( mins * 60 * 1000 );
      }

      data.looptimes = [
        {'id':minutesToMillisecondsString(0.25),'value':'0.25'},
        {'id':minutesToMillisecondsString(0.5),'value':'0.5'},
        {'id':minutesToMillisecondsString(1),'value':'1'},
        {'id':minutesToMillisecondsString(5),'value':'5'},
        {'id':minutesToMillisecondsString(15),'value':'15'},
        {'id':minutesToMillisecondsString(30),'value':'30'},
        {'id':minutesToMillisecondsString(60),'value':'60'}
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
      'description': params.description || params.name,
      'script': params.script_id,
      //'hosts': params.hosts_id
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
      failure: error => res.send(error.statusCode, error),
      success: task => res.json(task)
    });
  },
  // POST
  schedule: function(req,res) {
    var supervisor = req.supervisor;
    supervisor.create({
      route: supervisor.TASK + '/' + req.body.task + '/schedule',
      body: req.body,
      failure: error => res.send(500, error),
      success: schedule => res.json(schedule)
    });
  },
  // GET
  getSchedule: function(req, res) {
    var supervisor = req.supervisor;
    var id = req.param("id", null);
    if (!id||!id.match(/^[a-fA-F0-9]{24}$/)) {
      return res.send(400,'invalid id');
    } else {
      supervisor.getTaskSchedule(id, function(err, scheduleData){
        if (err) return res.send(500, err);
        res.send(200, scheduleData);
      });
    }
  },
  cancelSchedule: function(req, res) {
    var supervisor = req.supervisor;
    var taskId = req.param("id", null);
    var scheduleId = req.param("scheduleId", null);
    if ( ! taskId || ! taskId.match(/^[a-fA-F0-9]{24}$/) ) {
      return res.send(400,'invalid id');
    } else if ( ! scheduleId || ! scheduleId.match(/^[a-fA-F0-9]{24}$/) ) {
      return res.send(400,'invalid schedule id');
    } else {
      supervisor.remove({
        route: '/:customer/task',
        id: taskId,
        child: 'schedule/' + scheduleId,
        failure: error => res.send(500, error),
        success: task => res.json(task)
      });
    }
  },
  //trigger: function(req, res) {
  //  var supervisor = req.supervisor
  //  supervisor.create({
  //    route: supervisor.JOB,
  //    query: { task: req.body.task_id },
  //    failure: error => res.send(error.statusCode, error),
  //    success: job => res.json(job)
  //  })
  //}
}
