var debug = require('debug')('eye:web:controller:hostgroup:monitortemplate');

module.exports = {
  update: function(req, res) {
    if( !req.is('application/json') ) return res.send(406);

    var supervisor = req.supervisor;
    var body = req.body;
    var groupid = req.params.groupid;
    var monitorid = req.params.monitorid;

    var data = ! body.monitor ? { monitor: body } : body;

    supervisor.hostgroupmonitortemplateUpdate(
      groupid,
      monitorid,
      data,
      function(err, monitor){
        if(err) return res.send(err.statusCode, err);
        res.send(200,{ monitor: monitor });
      });
  },
  create: function(req, res){
    if( !req.is('application/json') ) return res.send(406);

    var supervisor = req.supervisor;
    var body = req.body;
    var groupid = req.params.groupid;

    var data = ! body.monitor ? { monitor: body } : body;

    supervisor.hostgroupmonitortemplateCreate(
      groupid,
      data,
      function(err, monitor){
        if(err) return res.send(err.statusCode, err);
        res.send(200,{ monitor: monitor });
      });
  },
  destroy: function(req, res){
    var supervisor = req.supervisor;
    var groupid = req.params.groupid;
    var monitorid = req.params.monitorid;

    supervisor.hostgroupmonitortemplateDelete(
      groupid,
      monitorid,
      function(err, monitor){
        if(err) return res.send(err.statusCode, err);
        res.send(200);
      }
    );
  }
}
