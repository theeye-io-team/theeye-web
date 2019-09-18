'use strict';

var debug = require('debug')('eye:web:hoststats');

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
        if (['host-stats', 'psaux'].indexOf(resource) != -1) {
          var room = ':customer:_:hostname:_:resource:'
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
  }
}
