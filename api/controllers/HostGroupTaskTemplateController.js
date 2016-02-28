var debug = require('debug')('eye:web:controller:hostgroup:tasktemplate');

module.exports = {
  update: function(req, res) {
    if( !req.is('application/json') ) return res.send(406);

    var supervisor = req.supervisor;
    var jsonbody = req.body;
    var groupid = req.params.groupid;
    var taskid = req.params.taskid;

    supervisor.hostgrouptasktemplateUpdate(
      groupid,
      taskid,
      jsonbody,
      function(err, task){
        if(err) return res.send(err.statusCode, err);
        res.send(200,{ task: task });
      });
  },
  create: function(req, res){
    if( !req.is('application/json') ) return res.send(406);

    var supervisor = req.supervisor;
    var jsonbody = req.body;
    var groupid = req.params.groupid;

    supervisor.hostgrouptasktemplateCreate(
      groupid,
      jsonbody,
      function(err, task){
        if(err) return res.send(err.statusCode, err);
        res.send(200,{ task: task });
      });
  },
  destroy: function(req, res){
    var supervisor = req.supervisor;
    var groupid = req.params.groupid;
    var taskid = req.params.taskid;

    supervisor.hostgrouptasktemplateDelete(
      groupid,
      taskid,
      function(err, task){
        if(err) return res.send(err.statusCode, err);
        res.send(200);
      }
    );
  }
}
