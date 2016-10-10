/* global User, Passport, sails */
var validator   = require('validator');
var crypto      = require("crypto");
var querystring = require("querystring");
var underscore  = require("underscore");
var debug       = require('debug')('eye:web:service:protocol:local');
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

exports.createUser = function(req, res, next) {
  var params = req.params.all();
  params.enabled = true;

  User.create(params, function (err, user) {
    if (err) return next(err);

    Passport.create({
      protocol : 'local',
      password : params.password,
      user : user.id
    }, function (err, passport) {
      if (err) return next(err);

      return next(null, user);
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
      debug('Error updating user');
      return next(error);
    }

    return next(null, token);
  });
}

exports.getActivationLink = function (user) {
  var queryToken = querystring.stringify({ token: user.invitation_token });
  var url = sails.config.passport.local.activateUrl;
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
exports.inviteToCustomer = function (req, res, next) {
  var email = req.param('email');
  var customers = req.param('customer') ? [req.param('customer')] : req.param('customers');
  var credential = req.param('credential');

  if(!email) {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next('No email was entered.');
  }

  if(customers.length === 0) {
    req.flash('error', 'Error.Passport.Customers.Missing');
    return next('No customers was entered.');
  }

  User.findOne({email: email}, function (err, user) {
    if (err) {
      debug('//////////////// ERROR.DB ////////////////');
      debug(err);
      return next('Error.DB');
    }

    if(!user) {
      // Scenario: User dont exist
      // Action: create the user disabled
      var token = getActivationToken(email);
      User.create({
        enabled: false,
        invitation_token: token,
        username: email,
        email: email,
        customers: customers,
        credential: credential
      }, function (err, user) {
        if (err) {
          if (err.code === 'E_VALIDATION') {
            debug('////////////////// ERROR.DB.VALIDATION ///////////////////');
            if (err.invalidAttributes.email) {
              req.flash('error', 'Error.Passport.Email.Exists');
            }else if (err.invalidAttributes.username) {
              req.flash('error', 'Error.Passport.User.Exists');
            } else {
              req.flash('error', 'Error.Passport.Unknown');
            }
          }
          debug(err);
          return next(err);
        } else {
          return next(null, user);
        }
      });
    } else {
      // Scenario: User exist
      // Action: Assign the customer
      customers = underscore.union(user.customers, customers);

      //If the user exists and have perms for the selected customers dont send the activation email
      if(user.customers.length == customers.length) {
        req.flash('error', 'Error.Passport.User.Exists.Customer');
        //text is error
        //error returning behaviour is somewhat broken
        //if i send here a new Error('message'), front end receives only {}
        return next("The user allready exists and have permissions for this customer");
      }

      User.update({ id: user.id },{ customers: customers },
        function(error, users) {
          if(error) {
            debug('Error updating user');
            debug(error);
          }
          return next(error, users[0]);
        });
    }
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
exports.activate = function (req, res, next) {
  var username = req.param('username')
  , password = req.param('password')
  , invitation_token = req.param('invitation_token');

  if (!username) {
    debug('No username was entered');
    req.flash('error', 'Error.Passport.Username.Missing');
    return next(new Error('No username was entered.'));
  }

  if (!invitation_token) {
    debug('No invitation_token was entered');
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No invitation_token was entered.'));
  }

  if (!password) {
    debug('No password was entered');
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No password was entered.'));
  }

  User.findOne({
    invitation_token: invitation_token
  }, function(err, user){
    if(err) {
      debug(err);
      return next(err);
    }

    if(!user) {
      debug('User not found');
      return next(new Error("No user found"));
    }

    debug("Creating user %s local passport", user.id);
    Passport.create({
      protocol : 'local',
      password : password,
      user : user.id
    }, function (err, passport) {
      if(err) {
        debug(err);
        return next(err);
      }

      debug("Enabling user %s", user.id);

      User.update({
        invitation_token : invitation_token
      }, {
        username: username,
        password: password,
        enabled: true,
        invitation_token: ''
      }, function (err, users) {
        if(err) {
          debug(err);
          return next(err);
        }
        return next(null, users[0]);
      });
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
  var username        = req.param('username')
    , password        = req.param('password')
    , newPassword     = req.param('newPassword')
    , confirmPassword = req.param('confirmPassword');

  if (!username)
    return next(new Error('No username was entered.'));

  if (!password || !newPassword || !confirmPassword)
    return next(new Error('No password was entered.'));

  if (confirmPassword !== newPassword)
    return next(new Error('Passwords do not match.'));

  User.findOne({username : username},function (err, user) {
    if (err)
      return next(err);

    if(!user)
      return next(new Error('User not found.'));

    Passport.update( {protocol : 'local', user: user.id},
    {password: newPassword},
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
    console.log('//////////////////');
    req.flash('error', 'Error.Passport.Password.Empty');
    return next(null, false);
  }
  var isEmail = validator.isEmail(identifier)
    , query   = {};

  if (isEmail) {
    query.email = identifier;
  } else {
    query.username = identifier;
  }

  User.findOne(query, function (err, user) {
    if (err) return next(err);

    if (!user) {
      sails.log.debug('user not found %s@%s', identifier, password);
      if (isEmail) {
        req.flash('error', 'Error.Passport.Email.NotFound');
      } else {
        req.flash('error', 'Error.Passport.Username.NotFound');
      }

      return next(null, false);
    }

    sails.log.debug('validating local passport user %s', user);

    Passport.findOne({
      protocol : 'local'
    , user     : user.id
    }, function (err, passport) {
      sails.log.debug('passport %s', passport);
      if (passport) {
        passport.validatePassword(password, function (err, res) {
          if (err) {
            sails.log.error('validate password error %s', err);
            return next(err);
          }

          if (!res) {
            sails.log.debug('error wrong password');
            req.flash('error', 'Error.Passport.Password.Wrong');
            return next(null, false);
          } else {
            return next(null, user);
          }
        });
      } else {
        sails.log.debug('error password not set');
        req.flash('error', 'Error.Passport.Password.NotSet');
        return next(null, false);
      }
    });
  });
};
