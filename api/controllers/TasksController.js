var debug = require('debug')('eye:controller:tasks');
var async = require('async');
var extend = require('util')._extend;

module.exports = {
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
