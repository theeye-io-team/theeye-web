/* global Passport, User, sails */
// var request = require('request');
var snsreceiver = require('../services/snshandler');
// var customeruri = require('../services/customeruri');

module.exports = {
  _config: {
    shortcurts: false,
    rest: false
  },
  index: function(req, res) {
    res.view(); // template render
  },
  subscribe: function(req, res) {
    var socket = req.socket;
    var user = req.user;
    var customer = req.params.all().customer;

    if( user.customers.indexOf( customer ) === -1 ){
      res.send( 403, JSON.stringify({ message: 'forbiden' }) );
    }

    var room = customer + '_job_updates';
    socket.join(room);

    sails.log.debug('client subscribed to ' + room);

    res.json({
      message: 'subscribed to ' + customer + ' customer job updates'
    });
  },
  trigger: function(req, res) {
    var supervisor = req.supervisor;
    supervisor.create({
      route: supervisor.JOB,
      query: { task: req.body.task_id },
      failure: error => res.send(error.statusCode, error),
      success: job => res.json(job)
    });
  },
  /**
   * Receive SNS messages, automatically sent by the supervisor.
   */
  update: function(req, res, next) {
    // sns updates received
    var body = req.body;
    sails.log.debug('trigger/job update received');
    sails.log.debug(body);

    snsreceiver.handleSubscription(body, function(error, action) {
      if(error||!body.Message) {
        sails.log.error('Error Invalid request');
        sails.log.error(body);
        return res.json({'status':400,'error':{'message':'invalid request'}});
      } else {
        var result = snsreceiver.parseSNSMessage(body.Message);
        if(!result) {
          return res.json({
            'status': 400,
            'error': {
              'message': "SNS body.Message Couldn't be parsed" ,
              'received': body.Message
            }
          });
        }

        if(action == 'continue'){
          var room = result.customer_name + '_job_updates';
          sails.log.debug('sending information via socket to ' + room);
          var io = sails.io;
          io.sockets.in(room).emit('palancas-update', result);
        }
        return res.json({ status: 'ok' });
      }
    });
  }
};
