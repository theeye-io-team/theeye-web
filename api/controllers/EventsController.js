/* global async, sails, _ */
var debug = require('debug')('eye:web:events');
var moment = require('moment');
var snsreceiver = require('../services/snshandler');
var ACL = require('../services/acl');

module.exports = {
  index: function(req, res) {
    var supervisor = req.supervisor;
    async.parallel({
      resources: (callback) => supervisor.fetch({
        route: supervisor.RESOURCE,
        success: (body) => callback(null, body),
        failure: (err) => callback(err)
      }),
      tasks: function(callback) {
        supervisor.tasks((err,data) => {
          if (err) {
            if (err.statusCode=='403') {
              callback();
            } else {
              callback(err);
            }
          } else {
            callback(null,data);
          }
        });
      }
    }, function(err, data) {
      if (err) {
        debug(err);
        return res.serverError("Error getting data from supervisor: " + err);
      }

      var isAdmin = ACL.isAdmin(req.user);

      data.moment = moment;

      function sendResponse () {
        var subs = _.chain(data.resources)
        .reject({type:'psaux'}) // esto es para que ni lleguen los psaux
        .filter(function(r){
          return r.type != 'host' && r.type != 'scraper' && r.type != 'script' && r.type != 'process';
        })
        .groupBy('host_id')
        .value();

        var indexed = _.chain(data.resources)
        .reject({type:'psaux'}) // esto es para que ni lleguen los psaux
        .filter(function(r){
          return r.type == 'host' || r.type == 'scraper' || r.type == 'script' || r.type == 'process';
        })
        .map(function(i){
          if(i.type == 'host' && subs[i.host_id]) {
            i.subs = subs[i.host_id];
          }else{
            i.subs = []; //consistency on view iterator
          }
          return i;
        })
        .sortBy('name')
        .value();

        data.indexedResources = indexed;
        data.ACL = ACL;

        if(req.route.path.indexOf('test') > -1) {
          res.view('events/grouptest', data);
        } else {
          res.view('events/index', data);
        }
      }

      if (isAdmin) {
        // get agent cURL
        var theeye = require('../services/passport').protocols.theeye;
        theeye.getCustomerAgentCredentials(
          req.session.customer,
          supervisor,
          function(error, userAgent) {
            if(error) debug(error);
            data.agent = userAgent;
            data.agentBinary = sails.config.application.agentBinary;
            sendResponse();
          }
        );
      } else sendResponse();
    });
  },
  subscribe: function(req, res) {
    var socket = req.socket;
    for (var i in req.user.customers) {
      var customer = req.user.customers[i];
      socket.join(customer + '_events');
    }

    res.json({ message: 'subscribed to customers events' });
  },
  update: function(req, res) {
    // sns updates received
    var body = req.body;
    debug('event update received');
    debug(body);
    snsreceiver.handleSubscription(body, function(error, action) {
      if( error || ! body.Message ) {
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
            message.last_update_moment = moment(message.last_update).startOf('second').fromNow();
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
