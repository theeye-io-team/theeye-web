/* global User, Passport, sails */
var isEmail = require('validator/lib/isEmail');
var crypto = require("crypto");
var querystring = require("querystring");
var underscore  = require("underscore");
var logger = require('../../libs/logger')('service:protocols:local');
var theeye = require("./theeye");
/**
 * Local Authentication Protocol
 *
 * The most widely used way for websites to authenticate users is via a username
 * and/or email as well as a password. This module provides functions both for
 * registering entirely new users, assigning passwords to already registered
 * users and validating login requesting.
 *
 * For more information on local authentication in Passport.js, check out:
 * http://passportjs.org/guide/username-password/
 */

/**
 * Register a new user
 *
 * This method creates a new user from a specified email, username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.register = function (req, res, next) {
  var email    = req.param('email')
    , username = req.param('username')
    , password = req.param('password');

  if (!email) {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next(new Error('No email was entered.'));
  }

  if (!username) {
    req.flash('error', 'Error.Passport.Username.Missing');
    return next(new Error('No username was entered.'));
  }

  if (!password) {
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No password was entered.'));
  }

  User.create({ username: username, email : email }, function (err, user) {
    if (err) {
      if (err.code === 'E_VALIDATION') {
        if (err.invalidAttributes.email) {
          req.flash('error', 'Error.Passport.Email.Exists');
        }else if (err.invalidAttributes.username) {
          req.flash('error', 'Error.Passport.User.Exists');
        } else {
          req.flash('error', 'Error.Passport.Unknown');
        }
      }

      return next(err);
    }

    Passport.create({
      protocol: 'local',
      password: password,
      user: user.id
    }, function (err, passport) {
      if (err) {
        if (err.code === 'E_VALIDATION') {
          req.flash('error', 'Error.Passport.Password.Invalid');
        }

        return user.destroy(function (destroyErr) {
          next(destroyErr || err);
        });
      }

      next(null, user);
    });
  });
};

/**
 * Reset activation link & token for a user
 *
 * @param {Function} next
 */
exports.resetActivationToken = function (user, next) {
  var token = getActivationToken(user.email);

  var query = { id: user.id };
  var updates = { invitation_token: token };
  User.update(query, updates, function (error, user) {
    if(error) {
      logger.error('Error updating user');
      return next(error);
    }

    return next(null, token);
  });
}

exports.getActivationLink = function (user) {
  var queryToken = new Buffer( JSON.stringify({ invitation_token: user.invitation_token }) ).toString('base64')
  var url = sails.config.passport.local.activateUrl;
  return (url + queryToken);
}

exports.getPasswordResetLink = function (token) {
  var queryToken = new Buffer( JSON.stringify({ token: token }) ).toString('base64')
  var url = sails.config.application.baseUrl + '/passwordreset?';
  return (url + queryToken);
}

function getActivationToken (string){
  var seed = string + Date.now();
  var token = crypto.createHmac("sha1",seed).digest("hex");
  return token;
}

/**
 * Invite a user to a customer
 *
 * This method creates a new user if does not exists and assign to a customer.
 * If it exists assign the customer
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 * @return {User}
 */
exports.inviteMember = function (data, supervisor, next) {
  var email = data.email;
  var customer = data.customer;

  if(!email) {
    logger.error('No email was entered.');
    return next('No email was entered.');
  }

  if(!customer) {
    logger.error('No customer was entered.');
    return next('No customer was entered.');
  }

  User.findOne({email: email}, function (err, user) {
    if (err) {
      logger.error('%o',err);
      return next('Internal sever error.');
    }
    if(!user) {
      logger.error('%o',err);
      return next('Cannot invite member, user not found.');
    }

    if(user.customers.includes(customer)){
      if(user.enabled) {
        //If the user is member and is active, dont sent activation/invitation email
        logger.error("The user already has permissions for this customer.");
        return next("activeMember");
      } else {
        //If the user is member but is inactive, resend invitation email
        return next(null, user)
      }
    }

    user.customers.push(customer)
    User.update({ id: user.id },{ customers: user.customers },
      function(error, users) {
        if(error) {
          logger.error('Error updating user customers.');
          logger.error('%o',error);
          return next(error);
        }
        if(users[0].enabled){
          var route = customer + '/member/';
          theeye.addMemberToCustomer(
            users[0].id,
            {customers: users[0].customers},
            supervisor,
            route,
            error => {
              if (error) {
                logger.error('%o',error);
                return next('The user was updated but with errors.')
                res.json(500,'the user was updated but with errors. ' + error.message);
              } else {
                return next(null, users[0]);
              }
            }
          );
        } else {
          return next(null, users[0]);
        }
      }
    );
  });
}

/**
 * create user
 *
 * This method creates a new user.
 *
 */
exports.createUser = function (data, next) {
  var token = getActivationToken(data.email);
  if(!data.enabled) {
    delete data.password;
    data.invitation_token = token;
  }
  User.create(data, function (err, user) {
    if (err) return next(err);
    return next(null, user);
  });
}

/**
 * Activate user account
 *
 * This method update user username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.activate = function (user, password, customername, next) {
  logger.debug("Creating user %s local passport", user.id);
  Passport.create({
    protocol : 'local',
    password : password,
    user : user.id
  }, function (err, passport) {
    if(err) {
      logger.error('%o',err);
      return next(err);
    }

    logger.debug("Enabling user %s", user.id);

    var data = {
      username: user.username,
      password: password,
      enabled: true,
      invitation_token: ''
    }

    if (customername && user.customers.length == 0)
      data.customers = [customername]

    User.update({
      invitation_token : user.invitation_token
    }, data, function (err, users) {
      if(err) {
        logger.error('%o',err);
        return next(err);
      }
      return next(null, users[0]);
    });
  });
}

/**
 * Update user local passport
 *
 * This method update password
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.update = function (req, res, next) {
  var id        = req.param('id')
    , password        = req.param('password')
    , newPassword     = req.param('newPassword')
    , confirmPassword = req.param('confirmPassword');

  if (!id)
    return next({error: new Error('No id was entered.'),status: 500});

  if (!password || !newPassword || !confirmPassword)
    return next({error: new Error('No password was entered.'),status: 500});

  if (confirmPassword !== newPassword)
    return next({error: new Error('Passwords do not match.'),status: 500});

  Passport.findOne({
    protocol : 'local',
    user     : id
  }, function (err, passport) {
    logger.debug('User passport found.');
    if (err) {
      logger.error('%o',err)
      return next({error: err,status: 500})
    }
    if(!passport){
      logger.error('User passport not found.')
      return next({error: new Error('User not found.'),status: 500})
    }

    passport.validatePassword(password, function (err, res) {
      if (err) {
        logger.error('validate password error %o', err);
        return next({error: err,statusCode: 500});
      }
      if (!res) {
        logger.error('Password validation failed');
        return next({error: new Error('Incorrect password.'),status: 400});
      }

      Passport.update( {protocol : 'local', user: id},
      {password: newPassword},
      function (err, passport) {
        if(err)
          return next({error: err,status: 500});
        return next(null);
      });
    })
  })
}

exports.reset = function (options, next) {
  var email = options.email,
    password = options.password;

  User.findOne({email: email},function (err, user) {
    if (err)
      return next(err);

    if(!user)
      return next(new Error('User not found.'));

    Passport.update( {protocol : 'local', user: user.id},
    {password: password},
    function (err, passport) {
      if(err) {
        if (err.code === 'E_VALIDATION')
          return next(new Error("Invalid password"));
        else
          return next(err);
      } else
        return next(null);
    });
  });
}

/**
 * Assign local Passport to user
 *
 * This function can be used to assign a local Passport to a user who doens't
 * have one already. This would be the case if the user registered using a
 * third-party service and therefore never set a password.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.connect = function (req, res, next) {
  var user     = req.user
    , password = req.param('password');

  Passport.findOne({ protocol: 'local' , user: user.id }, function (err, passport) {
    if (err) {
      return next(err);
    }

    if (!passport) {
      Passport.create({
        protocol : 'local'
      , password : password
      , user     : user.id
      }, function (err, passport) {
        next(err, user);
      });
    } else {
      next(null, user);
    }
  });
}

/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
exports.login = function (req, identifier, password, next) {
  //no pude hacer andar esto, le puse attribute required al password
  //en login.ejs como paleativo, pero cuando se manda sin password alguien
  //lo esta cortando en el camino (passport?)
  if(!password) {
    req.flash('error', 'Error.Passport.Password.Empty');
    return next(null, false);
  }
  var query   = {};

  if (isEmail(identifier)) {
    query.email = identifier;
  } else {
    query.username = identifier;
  }

  User.findOne(query, function (err, user) {
    if (err) return next(err);

    if (!user) {
      logger.debug('user not found %s@%s', identifier, password);
      return next(null, false);
    }

    if(!user.enabled) {
      logger.debug('inactive user found %s', user);
      return next(null, user);
    }

    logger.debug('validating local passport user %s', user);

    Passport.findOne({
      protocol : 'local',
      user     : user.id
    }, function (err, passport) {
      logger.debug('passport %s', passport);
      if (passport) {
        passport.validatePassword(password, function (err, res) {
          if (err) {
            logger.error('validate password error %s', err);
            return next(err);
          }

          if (!res) {
            logger.debug('error wrong password');
            return next(null, false);
          } else {
            return next(null, user);
          }
        });
      } else {
        logger.debug('error password not set');
        return next(null, false);
      }
    });
  });
}

exports.bearerVerify = (token, next) => {
  logger.debug('verifying bearer jwtoken')
  jwtoken.verify(token, (err, decoded) => {
    if (err) {
      logger.error(err.message)
      if (/expired/i.test(err.message)) {
        err.status = 401
      } else {
        err.status = 400
      }
      return next(err)
    }

    const uid = decoded.user_id

    if (!uid) {
      err = new Error('invalid token payload. invalid credentials')
      err.status = 400
      logger.error(err.message)
      logger.error(decoded)
      return next(err)
    }

    User.findOne({ id: uid }, (err, user) => {
      if (err) {
        logger.error(err.message)
        return next(err)
      }

      if (!user) {
        err = new Error('invalid token payload. credentials not found')
        logger.error(err.message)
        return next(err)
      }

      Passport.findOne({
        user: user.id,
        protocol: 'theeye'
      }, (err, passport) => {
        if (err) return next(err)

        if (!passport) {
          err = new Error('theeye passport not found')
          err.status = 500
          logger.error(err.message)
          return next(err)
        }

        user.theeye = {
          client_id: passport.profile.client_id,
          client_secret: passport.profile.client_secret,
          access_token: passport.token
        }

        next(null,user)
      })
    })
  })
}
