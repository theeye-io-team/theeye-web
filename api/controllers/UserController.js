/* global async, Passport, sails, User */
var passport = require('../services/passport');
var mailer = require('../services/mailer');
var underscore = require('underscore');

var UserController = module.exports = {
  //Current user home
  profile: function (req, res) {
    var supervisor = req.supervisor;
    if (typeof req.user !== 'undefined' ) {
      User
      .findOne({ id: req.user.id })
      .populate('passports')
      .exec(function(err, user) {
        if(err) {
          sails.log.error("error en passport ", err);
          res.view({
            user : 'Error!',
            errors : req.flash('error')
          });
        } else {
          var passports = {};
          user.passports.forEach(function(passport) {
            passports[passport.protocol] = passport;
          });

          var theeye = passport.protocols.theeye;
          theeye.getCustomerAgentCredentials(
            req.user.current_customer,
            supervisor,
            function(err, userAgent) {
              if(err) {
                // how to set the error on req.flash?
                sails.log.error('Error getting customerAgentCredentials', err);
              }
              //this here so, err or not, userAgent or not, view doesn't fail
              res.view({
                agentBinary : sails.config.application.agentBinary,
                agent : userAgent || null,
                user : user,
                passports : passports,
                errors : req.flash('error')
              });
            }
          );
        }
      });
    } else {
      sails.log.debug("cant find user session for %s", req.user.username);
      res.redirect ("/");
    }
  },
  //Set the customer for the session
  setcustomer (req, res) {
    const customer = req.params.customer
    const user = req.user

    if (user.customers.indexOf(customer) !== -1) {
      user.current_customer = customer
      user.save(err => {
        if (err) {
          return res.status(500).json('Internal Error')
        }
        res.send(200,{})
      })
    } else {
      res.send(403,'Forbidden')
    }
  },
  sendActivationLink: function(req, res, next) {
    passport.resendInvitation(req, res, next);
  },
  //ABM FUNCTIONS//
  //FETCH  /admin/user
  fetch: function(req, res) {
    User.find({
      username : { $ne: null }
    }, function(error, users) {
      if(error) return res.send(500, error);

      return res.json(users);
    });
  },
  //GET  /admin/user/:id
  // TODO: change how the API respond to GET/:id requests
  // This case shows we need separation on the API:Passport
  // from API:User
  get: function(req, res) {
    var params = req.params.all();
    var userId = params.id;

    User.findOne({
      id : userId
    }, function (err, user) {
      if (err) return res.send(500, err)
      if (!user) return res.send(404)

      Passport.findOne({
        user: userId,
        protocol: 'theeye'
      }, function (error, theeye) {
        user.theeye = theeye
        return res.json(user)
      });
    });
  },
  //POST  /admin/user/:id
  create: function(req, res) {
    var params = req.params.all();
    if(!params.customers) return res.send(400, 'You must select at least one customer');
    if(!params.username) return res.send(400, 'You must select a username');
    if(!params.email) return res.send(400, 'You must select an email');

    User.findOne({
      or: [
        {email: params.email},
        {username: params.username}
      ]
    }).exec((error,user) => {
      if (user) {
        if(user.username == params.username)
          return res.send(400, 'The username is taken. Choose another one');
        if(user.email == params.email)
          return res.send(400, 'The email is taken. Choose another one');
      } else {
        if (params.sendInvitation) {
          passport.inviteUser(req, res, function(err, user) {
            if(err) {
              sails.log.error(err);
              return res.send(400, err);
            } else return res.json(user);
          });
        } else {
          if (!params.password) {
            return res.send(400, 'Need password')
          }
          if(params.password !== params.confirmPassword)
            return res.send(400, 'Passwords don\'t match');
          if(params.password.length < 8)
            return res.send(400, 'Passwords must be at least 8 characters long');

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
      }
    });
  },
  /**
   *
   * PUT  /admin/user/:id
   *
   */
  edit (req, res) {
    var params = req.params.all();
    var userId = params.id;

    if (!params.customers) {
      return res.send(400, 'select at least one customer');
    }

    User.findOne({ id: userId },(error,user) => {
      if (!user) return res.send(404,'user not found');

      if (params.email!=user.email) {
        return res.send(403, 'user email can\'t be changed');
      }

      var customersChanged = underscore.difference(user.customers,params.customers).length !== 0;
      if (customersChanged && user.enabled) {
        // notify the user customers permissions changed
        mailer.sendCustomerPermissionsChanged(user, error => sails.log.error(error));
      }

      User.update({id: userId}, params).exec((error,user) => {
        if(error){
          sails.log.error(error);
          return res.send(500, 'internal server error');
        }

        passport.protocols.theeye.updateUser(
          userId,
          params,
          req.supervisor,
          error => {
            if (error) {
              sails.log.error(error);
              res.json(500,'the user was updated but with errors. ' + error.message);
            } else {
              res.json(user);
            }
          }
        );
      });
    });
  },
  /**
   *
   * DEL /admin/user/:id
   *
   */
  remove: function(req, res) {
    var userId = req.params.id;
    var supervisor = req.supervisor;

    if (!userId) {
      res.send(400, 'Parameter missing')
    }

    User.findOne({
      id : userId
    }, function(error, user) {
      if(error) return res.send(500, 'internal error');
      if(!user) return res.send(404, 'User not found');

      Passport.find({
        user: userId
      }, function(error2, passports){
        if(error2) {
          sails.log.error('//////////////// ERROR.DB ////////////////');
          sails.log.error(error2);
          return res.send(500, 'Internal passport error');
        }
        for(var i=0; i<passports.length; i++) {
          var passport = passports[i];

          if(passport.protocol == 'theeye') {
            sails.log.debug('destroying supervisor user %s', passport.profile.id);
            supervisor.userDelete( passport.profile.id, function(error3){
              if(error3) {
                sails.log.error('//////////////// WARN.DB ////////////////');
                sails.log.error(arguments);
                sails.log.error(
                  'error removing supervisor user %s error %s',
                  passport.profile.id,
                  error3
                );
              }
            });
          }

          sails.log.debug('destroying passport %s', passport.protocol);
          passport.destroy(function(error4){
            if(error4) {
              sails.log.error('//////////////// WARN.PASSPORT ////////////////');
              sails.log.error(error4);
              sails.log.error(
                'error removing user %s passport %s',
                user.id,
                passport.protocol
              );
            }
          });
        }

        sails.log.debug('destroying user %s', user.id);
        user.destroy(function(error5) {
          if(error5) {
            sails.log.error('//////////////// ERROR.DB ////////////////');
            sails.log.error(error5);
            sails.log.error('error removing user %s', user.id);
            return res.send(500, 'internal error');
          }
          return res.json(204, 'User deleted');
        });
      });
    });
  },
  myprofile (req, res) {
    const user = req.user

    Passport.findOne({
      user: user.id,
      protocol: 'theeye'
    }, (err, theeye) => {
      if (err) return res.send(500,err)
      user.theeye = theeye
      return res.json(user)
    })
  }
};
