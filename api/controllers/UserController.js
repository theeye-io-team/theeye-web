/* global async, Passport, sails, User */
var passport = require('../services/passport')
var mailer = require('../services/mailer')
var difference = require('lodash/difference')
var AWS = require('aws-sdk');
var SNS = new AWS.SNS( new AWS.Config( sails.config.aws ) );

const logger = require('../libs/logger')('controllers:apiv2')

var UserController = module.exports = {
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
    if (!params.customers) return res.send(400, 'at least one customer is required')
    if (!params.username) return res.send(400, 'username is required')
    if (!params.email) return res.send(400, 'email is required')
    if (!params.credential) return res.send(400, 'credential is required')

    var data = {
      username: params.username || params.email,
      email: params.email,
      customers: params.customers,
      credential: params.credential,
      enabled: !params.sendInvitation
    }

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
        if (data.enabled) {
          if (!params.password) {
            return res.send(400, 'Need password')
          }
          if(params.password !== params.confirmPassword)
            return res.send(400, 'Passwords don\'t match');
          if(params.password.length < 8)
            return res.send(400, 'Passwords must be at least 8 characters long');
          data.password = params.password
        }

        passport.createUser(req, res, data, function(err, user) {
          if(err) {
            logger.error(err);
            return res.send(400, err);
          } else return res.json(user);
        });
      }
    });
  },
  /**
   *
   * PUT  /admin/user/:id
   *
   */
  update (req, res) {
    var params = req.params.all();
    var userId = params.id;

    if (!params.credential) {
      return res.send(400, 'credential is required')
    }
    if (typeof params.credential != 'string') {
      return res.send(400, 'invalid credential. string required')
    }

    if (!params.customers) {
      return res.send(400, 'at least one customer is required')
    }

    User.findOne({ id: userId },(error,user) => {
      if (!user) return res.send(404,'user not found')

      if (params.email!=user.email) {
        return res.send(403, 'user email can\'t be changed')
      }

      var customersChanged = difference(user.customers,params.customers).length !== 0
      if (customersChanged && user.enabled) {
        // notify the user customers permissions changed
        mailer.sendCustomerPermissionsChanged(user, error => logger.error(error));
      }

      User.update({id: userId}, params).exec((error,user) => {
        if(error){
          logger.error(error);
          return res.send(500, 'internal server error');
        }

        passport.protocols.theeye.updateUser(
          userId,
          params,
          req.supervisor,
          error => {
            if (error) {
              logger.error(error);
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
          logger.error('//////////////// ERROR.DB ////////////////');
          logger.error(error2);
          return res.send(500, 'Internal passport error');
        }
        for(var i=0; i<passports.length; i++) {
          var passport = passports[i];

          if(passport.protocol == 'theeye') {
            logger.debug('destroying supervisor user %s', passport.profile.id);
            supervisor.userDelete( passport.profile.id, function(error3){
              if(error3) {
                logger.error('//////////////// WARN.DB ////////////////');
                logger.error('%o',arguments);
                logger.error(
                  'error removing supervisor user %s error %s',
                  passport.profile.id,
                  error3
                );
              }
            });
          }

          logger.debug('destroying passport %s', passport.protocol);
          passport.destroy(function(error4){
            if(error4) {
              logger.error('//////////////// WARN.PASSPORT ////////////////');
              logger.error('%o',error4);
              logger.error(
                'error removing user %s passport %s',
                user.id,
                passport.protocol
              );
            }
          });
        }

        logger.debug('destroying user %s', user.id);
        user.destroy(function(error5) {
          if(error5) {
            logger.error('//////////////// ERROR.DB ////////////////');
            logger.error('%o',error5);
            logger.error('error removing user %s', user.id);
            return res.send(500, 'internal error');
          }
          return res.json(204, 'User deleted');
        });
      });
    });
  },
  getuserpassport: function (req, res) {
    var supervisor = req.supervisor
    if (typeof req.user !== 'undefined' ) {
      User
      .findOne({ id: req.user.id })
      .populate('passports')
      .exec(function(err, user) {
        if(err) {
          logger.error('%o',err)
          return res.send(500, 'Error fetching user passports.')
        } else {
          var passports = {}
          user.passports.forEach(function(passport) {
            passports[passport.protocol] = passport;
          })
          return res.json(passports)
        }
      })
    } else {
      logger.error('%o',err)
      return res.send(500, 'Error fetching user passports.')
    }
  },
  registerdevicetoken: function (req, res) {
    var params = req.params.all()
    var userId = params.id

    var application_arn = params.platform === 'Android' ? sails.config.sns.push_notifications.android : sails.config.sns.push_notifications.ios

    User.findOne({ id: userId },(error,user) => {
      if (error) {
        logger.error('%o',error);
        return res.send(500, 'internal server error');
      }
      if (user) {
        SNS.createPlatformEndpoint({
          PlatformApplicationArn: application_arn,
          Token: params.device_token,
          CustomUserData: userId
        }, function(error, data) {
          if (error) {
            logger.error('%o',error);
            return res.send(500, 'internal server error');
          }

          user.devices = user.devices || []
          var index = user.devices.findIndex(elem => elem.uuid == params.uuid)
          if (index > -1) {
            if(user.devices[index].endpoint_arn !== data.EndpointArn) {
              //if new endpoint arn for an existant uuid, delete previous endpoint arn
              SNS.deleteEndpoint({
                EndpointArn: user.devices[index].endpoint_arn
              }, function(error, data) {
                if (error) {
                  logger.debug('Error deleting previous Endpoint Arn.')
                  logger.debug(error);
                } else {
                  logger.debug('Deleted previous Endpoint Arn.')
                }
              })
            }

            user.devices[index].device_token = params.device_token
            user.devices[index].endpoint_arn = data.EndpointArn
          } else {
            user.devices.push({
              uuid: params.uuid,
              device_token: params.device_token,
              platform: params.platform,
              endpoint_arn: data.EndpointArn
            })
          }

          User.update({id: userId}, {devices: user.devices}).exec((error,user) => {
            if (error) {
              logger.error('%o',error);
              return res.send(500, 'internal server error');
            }
            return res.send(200)
          })
        })
      } else {
        return res.send(404, 'User not found')
      }
    })
  }
}
