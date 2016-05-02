var debug = require('debug')('eye:web:events');
var moment = require('moment');
var snsreceiver = require('../services/snshandler');

module.exports = {
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      resources: function(callback) {
        supervisor.resources(callback);
      },
      tasks: function(callback) {
        supervisor.tasks(callback);
      },
      scripts: function(callback) {
        supervisor.scripts(callback);
      },
      hosts: function(callback) {
        supervisor.hosts(callback);
      },
      resourceTypes: function(callback) {
        supervisor.resourceTypes(callback);
      },
      scraperHosts: function(callback) {
        supervisor.scraperHosts(callback);
      }
    }, function(err, data) {
      if (err) {
        debug(err);
        return res.serverError("Error getting data from supervisor: " + err);
      }

      // get agent cURL
      var theeye = require('../services/passport').protocols.theeye;
      theeye.getCustomerAgentCredentials(
        req.session.customer,
        supervisor,
        function(err, userAgent) {
          if(err) {
            debug(err);
            return res.serverError("Error getting agent cURL: " + err);
          }
          data.agentCurl = userAgent.curl;
          data.moment = moment;
          res.view(data);
        }
      );
    });
  },
  subscribe: function(req, res) {
    var socket = req.socket;
    for (var i in req.user.customers) {
      var customer = req.user.customers[i];
      socket.join(customer + '_events');
    }

    res.json({
      message: 'subscribed to customers events'
    });
  },
  update: function(req, res) {
    // sns updates received
    var body = req.body;
    debug('event update received');
    debug(body);
    snsreceiver.handleSubscription(body, function(error, action) {
      if( error || ! body.Message )
      {
        debug.error('Error Invalid request');
        debug.error(body);
        res.json({
          'status': 400,
          'error': {
            'message': 'invalid request'
          }
        });
      } else {
        var message = snsreceiver.parseSNSMessage(body.Message);
        if(!message) {
          return res.json({
            'status': 400,
            'error': {
              'message': "SNS body.Message Couldn't be parsed" ,
              'received' : body.Message
            }
          });
        } else {
          if(action == 'continue') {
            var room = message.customer_name + '_events';
            debug('sending information via socket to ' + room);

            var io = sails.io;
            io.sockets.in(room).emit('events-update', message);

            res.json({ message: 'events updates received' });
          }
          else res.json({ message: 'no response' });
        }
      }
    });
  },
  /**
  * Overrides for the settings in `config/controllers.js`
  * (specific to EventsController)
  */
  _config: {
    shortcurts: false,
    rest: false
  }
};
