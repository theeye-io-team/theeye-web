var validator 	= require('validator');
var crypto 	  	= require("crypto");
var mailer 	  	= require("../mailer.js");
var querystring = require("querystring");
var _           = require("underscore");
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

  User.create({
    username : username
  , email    : email
  }, function (err, user) {
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
      protocol : 'local'
    , password : password
    , user     : user.id
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

exports.createUser = function(req, res, next)
{
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
}

/**
 * Restore user password
 *
 * This method create a reset password link for the user
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.retrievePassword = function (req, res, next)
{
  var email      = req.param('email');

  if (!email)
  {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next(new Error('No email was entered.'));
  }

  var hmac  = crypto.createHmac("sha1", email);
  var token = hmac.digest(encoding="base64");

  User.update({email: email},{invitation_token : token},function (err, user)
  {
    if (err)
      return next(err);

    var queryToken = querystring.stringify({token: token});
    debug('Reset password link: ' + sails.config.passport.local.activateUrl + queryToken );

    var data = {
      activationLink: sails.config.passport.local.activateUrl + queryToken,
      username      : email
    };
    return next(null, email, data);
  });
};

/**
 * Invite a new user
 *
 * This method creates a new user from a specified email
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.invite = function (req, res, next)
{
  var email = req.param('email');
  var customers = req.param('customer') ? [req.param('customer')] : req.param('customers');
  var credential = req.param('credential');

  //aca podriamos checkar por el logged user credential para evitar que cualuiera
  //cree usuarios. Eso o activamos acl
  if(!email) {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next(new Error('No email was entered.'));
  }

  var token = crypto.createHmac("sha1", email).digest(encoding="base64");

  if (customers.length === 0) {
    req.flash('error', 'Error.Passport.Customers.Missing');
    return next(new Error('No customers was entered.'));
  }
  User.findOne({email: email}, function (err, user)
  {
    if (err)
      return next(err);

    if(!user)
    {
  	  //Scenario: User dont exist
  	  //Action: create the user and send email invitation
  	  User.create({
  		invitation_token : token
  	  , username 		 : email
  	  , email    		 : email
  	  , customers        : customers
  	  , credential       : credential
  	  }, function (err, user)
      {
        if (err)
        {
          if (err.code === 'E_VALIDATION')
          {
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
    		else
    		{
          var queryToken = querystring.stringify({token: token});
          debug('Invitation link: ' + sails.config.passport.local.activateUrl + queryToken );

          var emailData = {
            email         : email,
            activationLink: sails.config.passport.local.activateUrl + queryToken,
            username      : email, // esto no es username, es el invitee's email
            //TODO esto deberia reemplazarse por nombre y apellido desde el profile
            //del connected user, para que quede mas serio
            inviter       : req.user.username,
            inviter_email : req.user.email
          };

          return next(null, email, emailData);
    		}
  	  });
	}
	else
  {
    //Scenario: User exist
    customers = _.union(user.customers, customers);

    //If the user exists and have perms for the selected customers dont send the activation email
    if(user.customers.length == customers.length) {
      req.flash('error', 'Error.Passport.User.Exists.Customer');
      return next(new Error("The user allready exists and have permissions for this customer"));
    }

    User.update({email: email},{customers: customers },function (err, user) {
      if(err) {
        debug('Error updating user');
        return next(err);
      }
      var data = { username: req.user.username };
      return next(err, email, data);
    });
  }
 });
};

exports.getactivationlink = function(input) {
  var token = crypto
    .createHmac('sha1', input.email)
    .digest(encoding='base64');

  var queryToken = querystring.stringify({ token: token });
  var url = sails.config.passport.local.activateUrl;

  return url + queryToken;
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
    , invitation_token = req.param('invitation_token')

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

  User.findOne({invitation_token : invitation_token}, function(err, user) {
    if(err) {
      debug('Error getting invitee');
      debug(err);
      return next(err);
    }
    if(!user) {
      debug('No user found');
      return next(new Error("No user found"));
    }

    User.findOne().where({ username: username, id : {'!': user.id}}).exec(function(err, duplicatedUser)
    {

      if(duplicatedUser)
      {
        debug('duplicated user');
        req.flash('error', 'Error.Passport.User.Exists');
        return next(new Error("No user found"));
      }

      debug("Creating user %s local passport", user.id);
      Passport.destroy({ protocol : 'local', user : user.id}, function (err, passport)
      {
        Passport.create({ protocol : 'local', password : password, user : user.id}, function (err, passport)
        {
          if (err)
          {
            if (err.code === 'E_VALIDATION')
              req.flash('error', 'Error.Passport.Password.Invalid');

            return next(new Error("Valiidation error"));
          }

          debug("Enabling user %s", user.id);

          User.update({invitation_token : invitation_token}, {
            username : username,
            password : password,
            enabled  : true,
            invitation_token : ''
          }, function (err, updatedUsers) {
            if (err || !user || !updatedUsers.length)
            {
              debug('Error updating user after invite process');
              debug(err);
              req.flash('error', '"Unexpected Error"');
              return next(err);
            } else {
              //return only the user, not array!
              return next(null, updatedUsers[0]);
            }

          });
        });
      });
    });
  });
};

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

  User.findOne({username : username},function (err, user)
  {
    if (err)
      return next(err);

    if(!user)
      return next(new Error('User not found.'));

    Passport.update( {protocol : 'local', user: user.id},
    {password: newPassword},
    function (err, passport)
    {
      if(err)
      {
        if (err.code === 'E_VALIDATION')
          return next(new Error("Invalid password"));
        else
          return next(err);
      }
      else
        return next(null);
    });
  });
};

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

  Passport.findOne({
    protocol : 'local'
  , user     : user.id
  }, function (err, passport) {
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
    }
    else {
      next(null, user);
    }
  });
};

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
  var isEmail = validator.isEmail(identifier)
    , query   = {};

  if (isEmail) {
    query.email = identifier;
  }
  else {
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
      }
      else {
        sails.log.debug('error password not set');
        req.flash('error', 'Error.Passport.Password.NotSet');
        return next(null, false);
      }
    });
  });
};
