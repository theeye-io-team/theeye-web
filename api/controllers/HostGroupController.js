var debug = require('debug')('eye:web:controller:hostgroup');

module.exports = {
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      groups: function(callback) {
        supervisor.hostgroupFetch({}, callback);
      },
      scripts: function(callback) {
        supervisor.scripts(callback);
      },
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
      res.view(data);
    });
  },
  create: function(req, res) {
    if( ! req.is('application/json') ){
      return res.send(406);
    }

    var supervisor = req.supervisor;
    var jsonbody = req.body;

    supervisor.hostgroupCreate(jsonbody,function(err, group){
      if(err) return res.send(err.statusCode, err);
      res.send(201,{ group: group });
    });
  },
  destroy: function(req, res) {
    var supervisor = req.supervisor;
    supervisor.hostgroupDelete(req.params.id, function(err){
      if(err) return res.send(err.statusCode, err);
      res.send(204);
    });
  },
  get: function(req, res) {
    var supervisor = req.supervisor;
    supervisor.hostgroupGet(req.params.id, function(err,group){
      if(err) return res.send(err.statusCode, err);
      res.send(200, group);
    });
  },
  update: function(req, res) {
    if( !req.is('application/json') ) return res.send(406);

    var supervisor = req.supervisor;
    var jsonbody = req.body;

    supervisor.hostgroupUpdate(
      req.params.id,
      jsonbody,
      function(err, group){
        if(err) return res.send(err.statusCode, err);
        res.send(200,{ group: group });
      });
  },
}
