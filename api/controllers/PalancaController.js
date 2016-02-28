var request = require('request');
var snsreceiver = require('../services/snshandler');
var customeruri = require('../services/customeruri');

var debug = {
  log: require('debug')('eye:web:palanca'),
  error: require('debug')('eye:web:palanca:error')
};

module.exports = {
  index: function(req, res) {
    res.view(); // template render
  },
  subscribe: function(req, res) {
    var socket = req.socket;
    for (var i in req.user.customers) {
      var customer = req.user.customers[i];
      var username = req.user.username;
      socket.join(customer + '_' + username + '_palancas');
    }

    res.json({
      message: 'subscribed to customer palancas'
    });
  },
  trigger: function(req, res)
  {
    var supervisor = req.supervisor;
    debug.log(req.body);

    triggerResult = function(err, job) {
      if (err) {
        return res.send(400, {
          message: "Error creating job on supervisor: " + err
        })
      }
      res.json({ job: job, message: 'Job created' });
    };

    supervisor.jobCreate( req.body.task_id, function (err, job) {
      if (err) {
        debug.error(err);
        return triggerResult(err);
      }
      debug.log('Job created');
      triggerResult(null, job);
    });
  },
  /**
   * Receive SNS messages, automatically sent by the supervisor.
   */
  update: function(req, res)
  {
    // sns updates received
    var body = req.body;
    debug.log('trigger/job update received');
    debug.log(body);

    snsreceiver.handleSubscription(body, function(error, action) {
      if( error || ! body.Message )
      {
        debug.error('Error Invalid request');
        debug.error(body);
        res.json({'status':400,'error':{'message':'invalid request'}});
      }
      else
      {
        var message = snsreceiver.parseSNSMessage(body.Message);
        if(!message) {
          return res.json({
            'status': 400,
            'error': {
              'message': "SNS body.Message Couldn't be parsed" ,
              'received' : body.Message
            }
          });
        }

        if(action == 'continue') {
          // sns updates received
          Passport.findOne({
            'protocol': 'theeye',
            'api_user': message.user_id
          }, function(err, passport){

            if(!passport){
              debug.error('user passport not found!');
              return res.send(500);
            }

            var query = User.findOne().where({ id : passport.user });
            query.exec(function(err, user) {
              if(err) {
                debug.error('internal error. cannot fetch user');
                return res.json({
                  'status': 400,
                  'error': { 'message': 'invalid request' }
                });
              }

              if(!user) {
                debug.error('user not found');
                return res.json({
                  'status': 404,
                  'error': { 'message': 'job was not found' }
                });
              }

              var room = message.customer_name + '_' + user.username + '_palancas';
              debug.log('sending information via socket to ' + room);
              var io = sails.io;
              io.sockets.in(room).emit('palancas-update', message);
              return res.json({ message: 'palancas updates received' });
            });
          });
        }
        else res.json({ message: 'no response' });
      }
    });
  },
  _config: {
    shortcurts: false,
    rest: false
  }
};
