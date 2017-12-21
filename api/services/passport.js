"use strict";

/* global Passport, User, sails, _ */
var path     = require('path')
  , url      = require('url')
  , passport = require('passport')
  , crypto    = require('crypto')
  , mailer 	 = require("./mailer")
  , TheEyeClient = require('../libs/theeye-client')
  , CustomStrategy = require('passport-custom').Strategy
  ;

/**
 * Passport Service
 *
 * A painless Passport.js service for your Sails app that is guaranteed to
 * Rock Your Socks™. It takes all the hassle out of setting up Passport.js by
 * encapsulating all the boring stuff in two functions:
 *
 *   passport.endpoint()
 *   passport.callback()
 *
 * The former sets up an endpoint (/auth/:provider) for redirecting a user to a
 * third-party provider for authentication, while the latter sets up a callback
 * endpoint (/auth/:provider/callback) for receiving the response from the
 * third-party provider. All you have to do is define in the configuration which
 * third-party providers you'd like to support. It's that easy!
 *
 * Behind the scenes, the service stores all the data it needs within "Pass-
 * ports". These contain all the information required to associate a local user
 * with a profile from a third-party provider. This even holds true for the good
 * ol' password authentication scheme – the Authentication Service takes care of
 * encrypting passwords and storing them in Passports, allowing you to keep your
 * User model free of bloat.
 */

// Load authentication protocols
passport.protocols = require('./protocols');

//set custom authentication for google mobile login
passport.use('google-mobile', new CustomStrategy(
  function(req, callback) {
    if(!req.body.email)
      return callback({statusCode: 400, message:'Email missing.'})
    User.findOne({email: req.body.email}, function(err, user){
      if(err)
        return callback({statusCode: 500, message:'Error searching for user.'})
      if(!user)
        return callback({statusCode: 400, message:'User not found.'})
      return callback(null, user)
    });
  }
));



/**
 * Connect a third-party profile to a local user
 *
 * This is where most of the magic happens when a user is authenticating with a
 * third-party provider. What it does, is the following:
 *
 *   1. Given a provider and an identifier, find a mathcing Passport.
 *   2. From here, the logic branches into two paths.
 *
 *     - A user is not currently logged in:
 *       1. If a Passport wassn't found, create a new user as well as a new
 *          Passport that will be assigned to the user.
 *       2. If a Passport was found, get the user associated with the passport.
 *
 *     - A user is currently logged in:
 *       1. If a Passport wasn't found, create a new Passport and associate it
 *          with the already logged in user (ie. "Connect")
 *       2. If a Passport was found, nothing needs to happen.
 *
 * As you can see, this function handles both "authentication" and "authori-
 * zation" at the same time. This is due to the fact that we pass in
 * `passReqToCallback: true` when loading the strategies, allowing us to look
 * for an existing session in the request and taking action based on that.
 *
 * For more information on auth(entication|rization) in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 * http://passportjs.org/guide/authorize/
 *
 * @param {Object}   req
 * @param {Object}   query
 * @param {Object}   profile
 * @param {Function} next
 */
passport.connect = function (req, query, profile, next) {
  var isLogin = (typeof req.user == "undefined")
  var provider = req.param('provider');
  var profileEmail;
  query.provider = provider;

  if (profile.hasOwnProperty('emails')) {
    profileEmail = profile.emails[0].value;
  }

  if (!provider){
    return next(new Error('No authentication provider was identified.'));
  }

  if (!profileEmail) {
    return next(new Error('Profile email not found.'));
  }

  User.findOne({email: profileEmail}, function(err, usr){
    if(err)
      return next(err);

    if(!usr) {
      if(isLogin) {
        return next(new Error('loginusernotfound'))
      } else {
        return next(new Error('connectusernotfound'))
      }
    }

    Passport.findOne({
      provider   : provider
    , identifier : query.identifier.toString()
    }, function (err, passport) {
      if(err)
        return next(err);

      if (!passport) {
        query.user = usr.id;
        Passport.create(query, function (err, passport) {
          if(err)
          return next(err);
          return next(null, {user: usr, isLogin: isLogin});
        });
      } else {
        return next(null, {user: usr, isLogin: isLogin});
      }
    });
  });
};

/**
 * Create an authentication endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param  {Object} req
 * @param  {Object} res
 */
passport.endpoint = function (req, res) {
  var strategies = sails.config.passport
    , provider   = req.param('provider')
    , options    = {};

  // If a provider doesn't exist for this endpoint, send the user back to the
  // login page
  if (!strategies.hasOwnProperty(provider)) {
    return res.redirect('/login');
  }

  // Attach scope if it has been set in the config
  if (strategies[provider].hasOwnProperty('scope')) {
    options.scope = strategies[provider].scope;
  }

  // Redirect the user to the provider for authentication. When complete,
  // the provider will redirect the user back to the application at
  //     /auth/:provider/callback
  this.authenticate(provider, options)(req, res, req.next);
};

passport.resendInvitation = function(req, res, next){
  var self = this;
  var params = req.params.all();
  var userId = params.id;

  User.findOne({ id: userId }, function(err, invitee){
    if(err) {
      sails.log.error(err);
      return res.send(500);
    }
    if( ! invitee ) return res.send(404,'User not found');
    if( invitee.enabled ) return res.send(400,'The user is already active');

    passport.protocols.local.resetActivationToken(invitee, function(error, token){
      invitee.invitation_token = token;
      passport.sendUserActivationEmail(req.user, invitee, function(error){
        if(error){
          sails.log.error(error);
          return res.send(500);
        }
        return res.send(200, invitee);
      });
    });
  });
}

/**
 *
 * the user is new and has been invited to complete registration
 * @author Facugon
 * @param {User} inviter
 * @param {User} invitee
 *
 */
passport.sendUserActivationEmail = function (inviter, invitee, next){
  var activationLink = this.protocols.local.getActivationLink(invitee);
  sails.log.debug('Activation Link is %s', activationLink);

  var data = {
    inviter: inviter,
    invitee: invitee,
    activationLink: activationLink
  };
  if (data.inviter == null) {
    mailer.sendRegistrationMail(data, function(err) {
      if(err) {
        sails.log.debug('error sending registration email to "%s"', invitee.email);
        return next(err);
      }

      sails.log.debug('invitation email sent');
      return next(null);
    });
  } else {
    mailer.sendActivationMail(data, function(err) {
      if(err) {
        sails.log.debug('error sending invitation email to "%s"', invitee.email);
        return next(err);
      }

      sails.log.debug('invitation email sent');
      return next(null);
    });
  }
}

passport.sendUserActivatedEMail = function (inviter, invitee, next){
  var data = {
    inviter: inviter,
    invitee: invitee
  };
  mailer.sendUserActivatedEMail(data, function(err) {
    if(err) {
      sails.log.debug('error sending Invitation email to "%s"', invitee.email);
      return next(err);
    }

    sails.log.debug('Invitation email sent');
    return next(null);
  });
}

passport.sendNewCustomerEMail = function (invitee, customername, next){
  var data = {
    invitee: invitee,
    customername: customername
  };
  mailer.sendNewCustomerEMail(data, function(err) {
    if(err) {
      sails.log.debug('error sending Invitation email to "%s"', invitee.email);
      return next(err);
    }

    sails.log.debug('Invitation email sent');
    return next(null);
  });
}

passport.inviteMember = function(req, res, data, next) {
  return this.protocols.local.inviteMember(data, req.supervisor, function(error, user) {
    if(error)
      return next(error)
    passport.sendNewCustomerEMail( user, data.customer, error => {
      return next(error, user)
    });
  });
}

passport.createUser = function(req, res, data, next) {
  return this.protocols.local.createUser(data, function(err, newUser) {
    if(err) return next(err);
    //if user is not enabled, send activation email
    if(newUser.enabled===false && newUser.invitation_token) {
      passport.sendUserActivationEmail( req.user, newUser, error => {
        return next(error, newUser)
      });
    } else {
      //if user is enabled, create passports and theeye user, notify the user
      if(newUser.enabled===true) {
        Passport.create({
          protocol : 'local',
          password : data.password,
          user : newUser.id
        }, function (err, userPassport) {
          if (err) return next(err);

          var supervisor = req.supervisor;
          var theeyeuser = {
            email: newUser.email,
            customers: newUser.customers,
            credential: newUser.credential,
            enabled: true,
            username: newUser.username||newUser.email
          };
          createTheeyeUser(
            newUser, theeyeuser, supervisor, function(err, profile){
              if(err)
                return next(err)
              passport.sendUserActivatedEMail( req.user, newUser, error => {
                return next(error, newUser)
              });
            }
          );
          return next(null, newUser);
        });
      } else {
        return next('User cannot be created.')
      }
    }
  });
};

passport.registerUser = function(req, res, next) {
  var supervisor = req.supervisor;
  var email = req.param('email');
  var username = req.param('username');

  return createRegisterUser(email, username, function(err, invitee) {
    if(err) return next(err);
    passport.sendUserActivationEmail( req.user, invitee, error => {
      next(error, invitee)
    });
  });
};

function createRegisterUser (email, username, next) {
  var customers = [];
  var credential = 'owner';

  var token = getActivationToken(email);
  User.create({
    enabled: false,
    invitation_token: token,
    username: username,
    email: email,
    customers: customers,
    credential: credential
  }, function (err, user) {
    if (err) {
      if (err.code === 'E_VALIDATION') {
        debug('////////////////// ERROR.DB.VALIDATION ///////////////////');
        if (err.invalidAttributes.email) {
          return next(new Error('Invalid email.'));
        }else if (err.invalidAttributes.username) {
          return next(new Error('Invalid username.'));
        } else {
          return next(err);
        }
      }
      debug(err);
      return next(err);
    } else {
      return next(null, user);
    }
  });
}

function getActivationToken (string){
  var seed = string + Date.now();
  var token = crypto.createHmac("sha1",seed).digest("hex");
  return token;
}

function activateTheeyeUser (user, next) {
  next||(next=function(){});

  var client = new TheEyeClient({
    'client_secret': sails.config.supervisor.client_secret,
    'client_id': sails.config.supervisor.client_id,
    'api_url': sails.config.supervisor.url
  });

  client.refreshToken(function(err,token){
    if(err){
     sails.log.debug(err);
      return next(err);
    }

   sails.log.debug('supervisor access token refresh success');
    var data = {
      'email':user.email,
      'customers':user.customers,
      'credential':user.credential,
      'enabled':true,
      'username': user.username||user.email
    };

   sails.log.debug("Creating user %s theeye passport", user.id);
    createTheeyeUser(user, data, client, function(err, profile){
      if(err) return next(err);
      return next(null, profile);
    });
  });
}

passport.activateUser = function(req, res, next) {
  var username = req.param('username')
  , password = req.param('password')
  , invitation_token = req.param('invitation_token')
  , customername = req.param('customername');

  if (!username) {
    sails.log.error('No username was entered');
    return next(new Error('No username was entered.'));
  }

  if (!invitation_token) {
    sails.log.error('No invitation_token was entered');
    return next(new Error('No invitation_token was entered.'));
  }

  if (!password) {
    sails.log.error('No password was entered');
    return next(new Error('No password was entered.'));
  }

  User.findOne({
    invitation_token: invitation_token
  }, function(err, user){
    if(err) {
      sails.log.error(err);
      return next(err);
    }
    if(!user) {
      var error = new Error('Cannot activate, user does not exist');
     sails.log.error(error);
      return next(error);
    }

    user.username = username;

    verifyUsername(user, function(error) {
      if (error) {
        sails.log.error('Verify username error');
        return next(error)
      }

      if(user.credential == 'owner') {
        if (!customername) {
          sails.log.error('No customername was entered');
          return next(new Error('No customername was entered.'));
        }

        createTheeyeUserAndCustomer(user, customername, function(error, profile) {
          if (error) {
            return next(error);
          }
          passport.protocols.local.activate(user, password, customername, function(err, updatedUser){
            if(err) {
              sails.log.error('Error activating user on local protocol');
              sails.log.error(err);
              return next(err);
            }
            next(null, updatedUser);
          });
        });
      } else {
        activateTheeyeUser(user, function(error, profile){
          if (error) {
            return next(error);
          }
          passport.protocols.local.activate(user, password, null, function(err, updatedUser){
            if(err) {
              sails.log.error('Error activating user on local protocol');
              sails.log.error(err);
              return next(err);
            }
            next(null, updatedUser);
          });
        });
      }
    })
  });
};

function verifyUsername(user, next) {
  User.findOne({
    username: user.username
  }, function(err, prevUser){
    if(err) {
      sails.log.error(err);
      return next(err);
    }
    if(!prevUser) {
      return next(null);
    } else {
      if(prevUser.invitation_token == user.invitation_token)
        return next(null);
    }
    return next({statusCode: 400, body: {error: 'Username already in use.'}});
  });
}

function createTheeyeUserAndCustomer (user, customername, next) {
  next||(next=function(){});

  var client = new TheEyeClient({
    'client_secret': sails.config.supervisor.client_secret,
    'client_id': sails.config.supervisor.client_id,
    'api_url': sails.config.supervisor.url
  });

  client.refreshToken(function(err,token){
    if(err){
     sails.log.debug(err);
      return next(err);
    }

    var data = {
      'email': user.email,
      'username': user.username,
      'credential': user.credential,
      'enabled': true,
      'customername': customername
    };

    sails.log.debug("Creating user %s theeye passport", user.id);

    client.create({
      route:'/register',
      body: data,
      success: function(profile) {
        Passport.create({
          protocol: 'theeye',
          provider: 'theeye',
          user: user.id ,
          token: profile.token,
          api_user: profile.id,
          profile: profile
        }, function (err, passport) {
          if (err) {
            sails.log.error(err);
            return next(err);
          }
          return next(null, profile);
        });
      },
      failure: function(err) {
        sails.log.error(err);
        return next(err)
      }
    });
  });
}

function createTheeyeUser (user, input, supervisor, next) {
 sails.log.debug('creating theeye user');
  var client = {
    'email': input.email,
    'customers': input.customers,
    'credential': input.credential,
    'client_id': input.client_id||null, // supervisor set a random one
    'client_secret': input.client_secret||null, // supervisor set a random one
    'enabled': input.enabled||true,
    'username': input.username||input.email
  };

  passport
    .protocols
    .theeye
    .createUser(user, client, supervisor, function(error, profile){
      if(error) return next(error);
      return next(null,profile);
    });
}

function searchpassport (user, next){
  sails.log.debug('searching passport theeye for user "%s"', user.username);
  Passport.findOne({
    user: user.id,
    protocol: 'theeye'
  }, function(error, passport){
    next(null, user, passport);
  });
}

passport.createmissingtheeyepassports = function(req, res, next) {
  User
  .find()
  .exec(function(error,users){
    for(var i=0; i<users.length; i++){
      var user = users[i];
      searchpassport(user, function(error, user, passport){
        if(!passport) {
          var data = {
            'email':user.email,
            'customers':user.customers,
            'credential':user.credential,
            'enabled':true,
            'username': user.username||user.email
          };
          createTheeyeUser(user, data, req.supervisor, function(error, profile) {
            if(error) sails.log.error('user %s passport create error', user.username);
            else sails.log.debug('passport created user %s', user.username);
          });
        }
        else sails.log.debug('passport found. skipping user %s', user.username);
      });
    }
  });
};

/**
 * Create an authentication callback endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
passport.callback = function (req, res, next) {
  var provider = req.param('provider', 'local')
    , action   = req.param('action');

  // Passport.js wasn't really built for local user registration, but it's nice
  // having it tied into everything else.

  if (provider === 'local' && action !== undefined)
  {
    if (action === 'register' && !req.user) {
      return this.protocols.local.register(req, res, next);
    }
    else if (action === 'connect' && req.user) {
      return this.protocols.local.connect(req, res, next);
    }
    else if (action === 'disconnect' && req.user) {
      return this.protocols.local.disconnect(req, res, next);
    }
    else {
      return next(new Error('Invalid action: '+ action));
    }
  }
  else
  {
    if (action === 'disconnect' && req.user) {
      this.disconnect(req, res, next) ;
    } else {
      sails.log.debug('authenticate provider %s', provider);
      // The provider will redirect the user to this URL after approval. Finish
      // the authentication process by attempting to obtain an access token. If
      // access was granted, the user will be logged in. Otherwise, authentication
      // has failed.
      this.authenticate(provider, next)(req, res, req.next);
    }
  }
};

/**
 * Load all strategies defined in the Passport configuration
 *
 * For example, we could add this to our config to use the GitHub strategy
 * with permission to access a users email address (even if it's marked as
 * private) as well as permission to add and update a user's Gists:
 *
    github: {
      name: 'GitHub',
      protocol: 'oauth2',
      strategy: require('passport-github').Strategy
      scope: [ 'user', 'gist' ]
      options: {
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
      }
    }
 *
 * For more information on the providers supported by Passport.js, check out:
 * http://passportjs.org/guide/providers/
 *
 */
passport.loadStrategies = function () {
  var self = this
  var strategies = sails.config.passport;

  Object.keys(strategies).forEach(function (key) {
    var options = { passReqToCallback: true }, Strategy;

    if (key === 'local') {

      _.extend(options, { usernameField: 'identifier' })
      const Local = require('passport-local').Strategy
      self.use(new Local(options, self.protocols.local.login))

      const Bearer = require('passport-http-bearer').Strategy
      self.use(new Bearer(self.protocols.local.bearerVerify))

    } else {

      var protocol = strategies[key].protocol
      var callback = strategies[key].callback

      if (!callback) {
        callback = path.join('auth', key, 'callback');
      }

      Strategy = strategies[key].strategy;

      var baseUrl = sails.getBaseurl();

      switch (protocol) {
        case 'oauth':
        case 'oauth2':
          options.callbackURL = url.resolve(baseUrl, callback);
          break;

        case 'openid':
          options.returnURL = url.resolve(baseUrl, callback);
          options.realm     = baseUrl;
          options.profile   = true;
          break;
      }

      // Merge the default options with any options defined in the config. All
      // defaults can be overriden, but I don't see a reason why you'd want to
      // do that.
      _.extend(options, strategies[key].options);

      self.use(new Strategy(options, self.protocols[protocol]));
    }
  });
};

/**
 * Disconnect a passport from a user
 *
 * @param  {Object} req
 * @param  {Object} res
 */
passport.disconnect = function (req, res, next) {
  var user     = req.user
    , provider = req.param('provider');

  Passport.findOne({
    provider : provider,
    user     : user.id
  }, function (err, passport) {
    if (err) {
      return next(err);
    }

    Passport.destroy(passport.id, function (error) {
      if (err) {
        return next(err);
      }

      next(null, user);
    });
  });
};

/**
 * Change password for local passport
 *
 * @param  {Object} req
 * @param  {Object} res
 * @param  {Function} next
 */
passport.updateLocalPassport = function (req, res, next) {
  return this.protocols.local.update(req, res, next);
};

passport.serializeUser(function (user, next) {
  sails.log.debug('serializing user %j', user);
  next(null, user.id);
});

passport.deserializeUser(function (id, next) {
  sails.log.debug('deserializing user');
  User.findOne(id, function(error,user){
    if(error) return next(error);

    if(!user) {
      sails.log.error('serialized user not found!');
      return next();
    }

    Passport.findOne({
      user : user.id,
      protocol : 'theeye'
    }, function(error, passport){
      if(error) return next(error);

      if(!passport) {
        sails.log.error('theeye passport not found!');
        user.theeye = {};
        return next(null,user);
      }

      user.theeye = {
        client_id: passport.profile.client_id,
        client_secret: passport.profile.client_secret,
        access_token: passport.token
      };

      next(error,user);
    });
  });
});


passport.connectSocialMobile = function (provider, identifier, user,  next) {
  Passport.findOne({
    provider   : provider
  , identifier : identifier
  }, function (err, passport) {
    if(err)
      return next(err);
    if (!passport) {
      var query = {
        identifier: identifier,
        protocol: 'oauth2',
        provider: provider,
        user: user.id
      }
      Passport.create(query, function (err, passport) {
        if(err)
          return next(err);
        return next(null, user);
      });
    } else {
      return next(null, user);
    }
  });
}

module.exports = passport;
