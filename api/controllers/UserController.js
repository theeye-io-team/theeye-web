var passport = require('../services/passport');
var debug = require('debug')('eye:web:controller:user');
var util = require('util');

var UserController = module.exports = {
  index: function(req, res)
  {
    var supervisor = req.supervisor;
    async.parallel({
      protocols: function(next){
        Passport.find({ protocol: 'theeye' }, next);
      },
      users: function(next){
        User.find({ username : { $ne: null } }, next);
      },
      customers: function(next){
        supervisor.customerFetch({}, next);
      },
    }, function(error, data){
      if(error) {
        return res.view({
          users : [],
          protocols : [],
          customers : [],
          errors : req.flash({message:'internal error',data:error})
        });
      }

      res.view({
        users : data.users,
        protocols: data.protocols,
        customers : data.customers,
        errors : null
      });
    });
  },
  //Current user home
  profile: function (req, res)
  {
    var supervisor = req.supervisor;
    if (typeof req.user !== 'undefined' )
    {
      User
      .findOne({id:req.user.id})
      .populate('passports')
      .exec(function(err, user) {
        if(err) {
          sails.log.error("error en passport ", err);
          res.view({
            user : 'Error!',
            errors : req.flash('error')
          });
        }
        else
        {
          var passports = {};
          user.passports.forEach(function(passport) {
            passports[passport.protocol] = passport;
          });
          var theeye = passport.protocols.theeye;
          theeye.getCustomerAgentCredentials(
            req.session.customer,
            supervisor,
            function(err, userAgent) {
              if(err) {
                // how to set the error on req.flash?
                sails.log.error('Error getting customerAgentCredentials', err);
              }
              //this here so, err or not, userAgent or not, view doesn't fail
              userAgent = userAgent || {};
              res.view({
                agentCurl : userAgent.curl,
                user : user,
                passports : passports,
                errors : req.flash('error')
              });
            }
          );
        }
      });
    } else {
      debug("cant find user session for %s", req.user.username);
      res.redirect ("/");
    }
  },
  //Set the customer for the session
  setcustomer: function(req, res)
  {
    var customers = req.user.customers;

    if( customers.indexOf( req.params.customer ) !== -1 ){
      req.session.customer = req.params.customer;
      res.send(200,{});
    } else res.send(403,{});
  },
  reSendInvitation: function(req, res)
  {
    var params = req.params.all();
    var userId = params.id;

    User.findOne({
      id : userId
    }, function(err, user) {
      if(err) {
        sails.log.error(err);
        return res.send(500);
      }
      if(!user) return res.send(404);

      passport.resendInvitationUser(user, function(error){
        if(error){
          sails.log.error(err);
          return res.send(500);
        }
        return res.send(200);
      });
    });
  },
  retrievePassword: function(req, res)
  {
    var params = req.params.all();
    var email = params.email;

    User.findOne({email : email}, function(err, user)
    {
      if(err || !user)
        return res.send(500, "User not found");

      user.destroy(function(err)
      {
        if(err)
          return res.send(500, "Error deleting user");
        else
        {
          req.params.email             = user.email;
          req.params.credential        = user.credential;
          req.params.customers         = user.customers;

          passport.retrievePassword(req, res, function(err, email)
          {
            if(err)
              return res.send(500, "Invitation not sent");
            else
              return res.json({email: email});
          });
        }
      });
    });
  },
  //ABM FUNCTIONS//
  //FETCH  /admin/user
  fetch: function(req, res)
  {
    var userId = req.query.userId;
    User.find({
      username : { $ne: null }
    }, function(error, users) {
      if(error) return res.send(500, error);

      return res.json({ user: users });
    });
  },
  //GET  /admin/user/:id
  get: function(req, res)
  {
    var params = req.params.all();
    var userId = params.id;

    User.findOne({
      id : userId
    }, function(err, user) {
      if(err) return res.send(500, err);

      Passport.findOne({
        user: userId,
        protocol:'theeye'
      }, function(error, passport) {
        if(!passport) return res.json({ user: user });

        return res.json({
          user: user,
          theeye: passport
        });
      });
    });
  },
  //POST  /admin/user/:id
  create: function(req, res)
  {
    var params = req.params.all();

    if(!params.sendInvitation && params.password !== params.confirmPassword)
      return res.send(400, 'Passwords doesn\'t match');
    if(!params.sendInvitation && params.password.length < 8)
      return res.send(400, 'Passwords must be at least 8 characters long');
    if(!params.customers)
      return res.send(400, 'You must select at least one customer');

    if(params.sendInvitation) {
      passport.inviteUser(req, res, function(err, user) {
        if(err) return res.send(500, err);
        else return res.json(user);
      });
    }
    else
    {
      passport.createUser(req, res, function(err, user) {
        if(err) {
          if (err.code === 'E_VALIDATION') {
            if (err.invalidAttributes.email)
              return res.send(400, 'Invalid email or already exists');
            if (err.invalidAttributes.username)
              return res.send(400, 'Invalid username or already exists');
          }
          return res.send(400, 'Invalid params');
        }
        return res.json(user);
      });
    }
  },
  /**
   *
   * PUT  /admin/user/:id
   *
   */
  edit: function(req, res)
  {
    var params = req.params.all();
    var userId = params.id;
    var supervisor = req.supervisor;

    if(!params.customers) return res.send(400, 'select at least one customer');

    var toUpdate = {};
    toUpdate.customers = params.customers;
    toUpdate.enabled = params.enabled;

    if(params.credential) toUpdate.credential = params.credential;

    var query = User.update({ id : userId }, toUpdate);
    query.exec(function(error, user) {
      if(error){
        debug(error);
        return res.send(500, 'internal server error');
      }

      var theeye = passport.protocols.theeye;
      theeye.updateUser(
        userId,
        toUpdate,
        supervisor,
        function(error, profile){
          if(error) return res.send(500, 'update error');
          res.json(user);
        }
      );
    });
  },
  /**
   *
   * DEL /admin/user/:id
   *
   */
  remove: function(req, res)
  {
    var userId = req.params.id;
    var supervisor = req.supervisor;

    User.findOne({
      id : userId
    }, function(error, user) {
      if(error) return res.send(500, 'internal error');
      if(!user) return res.send(400, 'User not found');

      Passport.find({
        user: userId
      }, function(error, passports){

        for(var i=0; i<passports.length; i++)
        {
          var passport = passports[i];

          if(passport.protocol == 'theeye')
          {
            sails.log.debug('destroying supervisor user %s', passport.profile.id);
            supervisor.userDelete(
              passport.profile.id,
              function(error){
                sails.log.error(
                  'error removing supervisor user %s error %s',
                  passport.profile.id,
                  error
                )
              });
          }

          sails.log.debug('destroying passport %s', passport.protocol);
          passport.destroy(function(err){
            if(err) sails.log.error(
              'error removing user %s passport %s',
              user.id,
              passport.protocol
            );
          });
        }

        sails.log.debug('destroying user %s', user.id);
        user.destroy(function(err) {
          if(err) {
            sails.log.error('error removing user %s', user.id);
            return res.send(500, 'internal error');
          }
          return res.send(204, 'User deleted');
        });
      });
    });
  },
};
