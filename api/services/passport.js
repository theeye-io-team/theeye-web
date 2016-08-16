"use strict";

/* global Passport, User, sails, _ */
var path     = require('path')
  , url      = require('url')
  , passport = require('passport')
  , mailer 	 = require("./mailer")
  , debug    = require('debug')('eye:web:user:passport')
  , TheEyeClient = require('theeye-client')
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
  var user = {}
    , provider;

  // Get the authentication provider from the query.
  query.provider = req.param('provider');

  // Use profile.provider or fallback to the query.provider if it is undefined
  // as is the case for OpenID, for example
  provider = profile.provider || query.provider;

  // If the provider cannot be identified we cannot match it to a passport so
  // throw an error and let whoever's next in line take care of it.
  if (!provider){
    return next(new Error('No authentication provider was identified.'));
  }

  // If the profile object contains a list of emails, grab the first one and
  // add it to the user.
  if (profile.hasOwnProperty('emails')) {
    user.email = profile.emails[0].value;
  }
  // If the profile object contains a username, add it to the user.
  if (profile.hasOwnProperty('username')) {
    user.username = profile.username;
  }

  // If neither an email or a username was available in the profile, we don't
  // have a way of identifying the user in the future. Throw an error and let
  // whoever's next in the line take care of it.
  if (!user.username && !user.email) {
    return next(new Error('Neither a username nor email was available'));
  }

  Passport.findOne({
    provider   : provider
  , identifier : query.identifier.toString()
  }, function (err, passport) {
    if (err) return next(err);

    if (!req.user)
    {
      User.findOne({email: user.email}, function(err, usr){
        if(usr)
        {
          // Scenario: An existing user is attempting to sign up using a third-party
          //           authentication provider.
          // Action:   Find the user and assign them a passport.
          if (err) return next(err);

          query.user = usr.id;

          if( usr.invitation_token !== '' )
          {
            // Scenario: An existing user is attempting to sign up using a third-party
            //           authentication provider for the first time
            // Action:   Find the user, set the status to enable, clear the invitation_token,
            //			 and assign them a passport.
            User.update({email: usr.email}, {enabled : true, invitation_token : ''}, function(err, user)
            {
              if(err) return next(err);
              else {
                Passport.create(query, function (err, passport) {
                  // If a passport wasn't created, bail out
                  if (err) return next(err);
                  return next(null, user[0]);
                });
              }
            });
          }
          else if( ! passport )
          {
            // Scenario: An existing user is attempting to sign up using a third-party
            //           authentication provider for the first time
            // Action:   Find the user and assign them a passport.
            Passport.create(query, function (err, passport) {
              // If a passport wasn't created, bail out
              if (err) return next(err);
              return next(null, usr);
            });
          }
          else return next(null, usr);
        }
        else
        {
          //Scenario: Someone is attempting to login and dont have an user account.
          req.flash('error', 'Error.Passport.User.Dont.Exists');
          return next(err);
        }
      });

    } else {
      // Scenario: A user is currently logged in and trying to connect a new
      //           passport.
      // Action:   Create and assign a new passport to the user.
      if(!passport)
      {
        query.user = req.user.id;

        Passport.create(query, function (err, passport) {
          // If a passport wasn't created, bail out
          if (err) return next(err);
          next(err, req.user);
        });
      }
      // Scenario: The user is a nutjob or spammed the back-button.
      // Action:   Simply pass along the already established session.
      else next(null, req.user);
    }
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

passport.resendInvitationUser = function(user, next){
  var local = this.protocols.local;
  local.resetActivationLink(user, function(error, link){

    var data = {
      'activationLink': link,
      'username': user.username
    };

    debug('Invitation link is %s', link);

    mailer.sendActivationMail(user.email, data, function(error) {
      if(error) {
        // req.flash('error','Error.Passport.User.Invite');
        debug('error sending invitation email to "%s"', user.email);
        return next(error);
      }

      debug('email invitation sent');
      return next(null);
    });
  });
}

passport.inviteUser = function(req, res, next) {
  var local = this.protocols.local;
  var supervisor = req.supervisor;
  return local.invite(req, res,
    function(err, email, emailData, user) {
      if(err) return next(err);

      if(emailData.activationLink){
        debug('Invitation link is %s', emailData.activationLink);

        //send activation email
        mailer.sendActivationMail(emailData.email, emailData, function(err) {
          if(err) {
            req.flash('error', 'Error.Passport.User.Invite');
            debug('error sending invitation email to "%s"', emailData.email);
            return next(err);
          }

          debug('email invitation sent');
          return next(null, {email : emailData.email});
        });
      } else {
        //send new customer notification email
        mailer.sendNewCustomerMail(emailData.email, emailData, function(err) {
          if(err) {
            req.flash('error', 'Error.Passport.User.Invite');
            debug("Error sending email to " + emailData.email);
            return next(err);
          }

          debug('Message sent');
          return next(null, {email : emailData.email});
        });
      }
    }
  );
};

function activateTheeyeUser (user, next) {
  next||(next=function(){});

	var client = new TheEyeClient({
		'client_secret': sails.config.supervisor.client_secret,
		'client_id': sails.config.supervisor.client_id,
		'api_url': sails.config.supervisor.url
	});

  client.refreshToken(function(err,token){
    if(err) return next(err);
    debug('supervisor access token refresh success');
    var data = {
      'email':user.email,
      'customers':user.customers,
      'credential':user.credential,
      'enabled':true
    };

    createTheeyeUser(user, data, client, function(err, profile){
      if(err) return next(err);
      return next(null, profile);
    });
  });
}

passport.activateUser = function(req, res, next){
  this.protocols.local.activate(req, res,
    function(err, user){
      if(err) {
        debug('Error activating user on local protocol');
        debug(err);
        return next(err);
      }

      if(!user) {
        var error = new Error('cannot activate, user does not exist');
        debug(error);
        return next(error);
      }

      activateTheeyeUser(user,function(error){
        next(error, user);
      });
    }
  );
};

passport.retrievePassword = function(req, res, next) {
  return this.protocols.local.retrievePassword(req, res, function(err, email, userData) {
    if(err)
      return next(err);

    mailer.sendRetrivePasswordMail(email, null, function(error) {
      if(err) {
        debug("error sending email invitation");
        req.flash('error', 'Error.Passport.User.Invite');
        debug("Error sending email to " + email);
        return next(err);
      }

      debug("email invitation sent");
      return next(null, email);
    });
  });
};

function createTheeyeUser (user, input, supervisor, next) {
  debug('creating theeye user');
  var client = {
    'email': input.email,
    'customers': input.customers,
    'credential': input.credential,
    'client_id': input.client_id||null, // supervisor set a random one
    'client_secret': input.client_secret||null, // supervisor set a random one
    'enabled': input.enabled||true
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
            'enabled':true
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

passport.createUser = function(req, res, next) {
  var supervisor = req.supervisor;
  var passport = this ;
  passport
    .protocols
    .local
    .createUser(req, res, function(error, user){
      if(error) next(error);
      var input = req.params.all();

      createTheeyeUser(
        user, input, supervisor, function(error,profile){
          return next(error,{
            local: user,
            theeye: profile
          });
        }
      );
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
    if (action === 'invite' && req.user) {
      return this.inviteUser(req, res, next);
    }
    if (action === 'activate') {
      //force user logout if logged in
      if(req.user) req.logout();
      return this.activateUser(req, res, next);
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
  var self       = this
    , strategies = sails.config.passport;

  Object.keys(strategies).forEach(function (key) {
    var options = { passReqToCallback: true }, Strategy;

    if (key === 'local') {
      // Since we need to allow users to login using both usernames as well as
      // emails, we'll set the username field to something more generic.
      _.extend(options, { usernameField: 'identifier' });

      // Only load the local strategy if it's enabled in the config
      if (strategies.local) {
        Strategy = strategies[key].strategy;

        self.use(new Strategy(options, self.protocols.local.login));
      }
    } else {
      var protocol = strategies[key].protocol
        , callback = strategies[key].callback;

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
        'client_id' : passport.profile.client_id,
        'client_secret' : passport.profile.client_secret,
        'access_token' : passport.token
      };
      next(error,user);
    });
  });
});

module.exports = passport;
