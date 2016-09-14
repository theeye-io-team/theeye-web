var debug = require('debug')('eye:web:hoststats');
var snsreceiver = require('../services/snshandler');
var roomNameFormat = ':customer:_:hostname:_:resource:';
var resources = ['host-stats', 'psaux'];
var eventNameFormat = ':resource:_:action:';

module.exports = {
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      host: (callback) => supervisor.host(req.params.host, callback) ,
      hostStats: (callback) => supervisor.hostStats(req.params.host, callback) ,
      hostResource: (callback) => supervisor.hostResource(req.params.host, callback) 
    },function(err, data){
      if(err) {
        debug('supervisor request error');
        res.view({ error: 'cannot connect server' });
      } else {
        res.view({
          error: null,
          host: data.host,
          cachedStats: data.hostStats,
          hostResource: data.hostResource
        });
      }
    });
  },
  subscribe: function(req, res) {
    var id = req.params.id;
    var resource = req.param('resource');
    var supervisor = req.supervisor;

    supervisor.host( id, function(err,host){
      if (resources.indexOf(resource) != -1) {
        var room = roomNameFormat
        .replace(':customer:', req.session.customer)
        .replace(':hostname:', host.hostname)
        .replace(':resource:', resource);

        var socket = req.socket;
        debug('suscribing socket to room %s', room);
        socket.join(room);

        res.json({ message: 'subscribed to room ' + room });
      } else {
        res.json({ message: 'invalid host resource ' + resource }, 400);
      }
    });
  },
  update: function(req, res) {
    // sns updates received
    var body = req.body;

    debug('host stat update received');

    snsreceiver.handleSubscription(body, function(error, action) {

      if (action == 'continue') {
        var message = JSON.parse(body.Message);

        var room = roomNameFormat
          .replace(':customer:', message.customer_name)
          .replace(':hostname:', message.hostname)
          .replace(':resource:', message.type);

        var io = sails.io;

        var eventName = eventNameFormat
          .replace(':resource:', message.type)
          .replace(':action:', 'update');

        debug('sending "%s" via socket to room "%s"', eventName, room);

        io.sockets
          .in(room)
        //.emit('charts-update', message)
        .emit(eventName, message);

        res.json({ message: 'host stats updates sent' });
      }
      else res.json();
    });
  },
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MonitorController)
   */
  _config: {
    shortcurts: false,
    rest: false
  }
};
