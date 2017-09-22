'use strict';

var debug = require('debug')('eye:web:hoststats');
var snsreceiver = require('../services/snshandler');
var roomNameFormat = ':customer:_:hostname:_:resource:';
var resources = ['host-stats', 'psaux'];
var eventNameFormat = ':resource:_:action:';

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MonitorController)
   */
  _config: {
    shortcurts: false,
    rest: false
  },
  index: (req, res) => res.view(),
  subscribe: function(req, res) {
    var id = req.params.id;
    var resource = req.param('resource');
    var supervisor = req.supervisor;

    supervisor.host(id, function(err,host){
      if (err) {
        res.send(500,{ message: err.message, error: err });
      } else if (!host) {
        res.send(400,{ message: 'host not found' });
      } else {
        if (resources.indexOf(resource) != -1) {
          var room = roomNameFormat
            .replace(':customer:', req.user.current_customer)
            .replace(':hostname:', host.hostname)
            .replace(':resource:', resource);

          var socket = req.socket;
          debug('suscribing socket to room %s', room);
          socket.join(room);

          res.send(200,{ message: 'subscribed to room ' + room });
        } else {
          res.send(200,{ message: 'invalid host resource ' + resource });
        }
      }
    });
  },
  // sns updates received
  update: function(req, res) {
    var body = req.body;
    debug('host stat update received');

    snsreceiver.handleSubscription(body, function(error,action){
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

        io.sockets.in(room).emit(eventName, message);

        res.json({ message: 'host stats updates sent' });
      }
      else res.json();
    });
  },
};
