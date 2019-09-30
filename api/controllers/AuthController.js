/* global passport, sails, User */
var GoogleAuth = require('google-auth-library');
const CLIENT_ID = sails.config.passport.google.options.clientID;
const logger = require('../libs/logger')('controllers:auth')
const request = require('request')

module.exports = {
  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout (req, res) {
    if (!req.user) return res.send(400)
    req.logout()
    res.send(200)
  },
  /**
   * Render the invite page
   *
   * Just like the login form, the invite form is just simple HTML:
   *
   <form role="form" action="/auth/local/invite" method="post">
   <input type="text" name="email" placeholder="Email">
   <button type="submit">Invite</button>
   </form>
   *
   * @param {Object} req
   * @param {Object} res
   */
  invite: function (req, res) {
    res.view({
      errors: req.flash('error'),
      customers : req.user.customers
    });
  },
  /**
   * Render the update password page
   *
   * Form for user account activation
   *
   * @param {Object} req
   * @param {Object} res
   */
  updateLocalPassport: function (req, res) {
    logger.debug("update local passport password");

    passport.updateLocalPassport(req, res, function(err)
    {
      if(err){
        if(err.status == 400) {
          return res.send(400, err.error.toString());
        }
        return res.send(500, err.toString());
      }
      else
        return res.send(200);
    });
  },
  /**
   * Create a third-party authentication endpoint
   *
   * @param {Object} req
   * @param {Object} res
   */
  socialAuth: function (req, res) {
    var strategies = sails.config.passport
      , provider   = req.param('provider')
      , options    = {};

    if (!strategies.hasOwnProperty(provider)) {
      return res.send(400, 'Strategy not found.')
    }

    if (strategies[provider].hasOwnProperty('scope')) {
      options.scope = strategies[provider].scope;
    }

    if (strategies[provider].options.hasOwnProperty('callbackURLLogin')) {
      options.callbackURL = strategies[provider].options.callbackURLLogin;
    }

    passport.authenticate(provider, options)(req, res, req.next);
  },
  /**
   * Create a third-party connection endpoint
   *
   * @param {Object} req
   * @param {Object} res
   */
  socialConnect: function (req, res) {
    var strategies = sails.config.passport
      , provider   = req.param('provider')
      , options    = {};

    if (!strategies.hasOwnProperty(provider)) {
      return res.send(400, 'Strategy not found.')
    }

    if (strategies[provider].hasOwnProperty('scope')) {
      options.scope = strategies[provider].scope;
    }

    if (strategies[provider].options.hasOwnProperty('callbackURLConnect')) {
      options.callbackURL = strategies[provider].options.callbackURLConnect;
    }

    passport.authenticate(provider, options)(req, res, req.next);
  },
  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function (req, res) {
    function tryAgain (err) {
      // Only certain error messages are returned via req.flash('error', someError)
      // because we shouldn't expose internal authorization errors to the user.
      // We do return a generic error and the original request body.
      var flashError = req.flash('error')[0];

      if(err) {
        return res.send(err.statusCode||500, err)
      }

      if (err && !flashError ) {
        req.flash('error', 'Error.Passport.Generic');
      } else if (flashError) {
        req.flash('error', flashError);
      }
      req.flash('form', req.body);

      // If an error was thrown, redirect the user to the
      // login, register or disconnect action initiator view.
      // These views should take care of rendering the error messages.
      var action = req.param('action');

      switch (action) {
        case 'register':
          res.redirect('/register');
          break;
        case 'invite':
          res.redirect('/invite');
          break;
        case 'disconnect':
          res.redirect('back');
          break;
        default:
          res.redirect('/login');
      }
    }

    passport.callback(req, res, function (err, user){
      if(err){
        logger.error('fatal error');
        logger.error(err);
        return tryAgain(err);
      }

      if(!user){
        logger.debug('authentication error %s user %s', err, user);
        return tryAgain();
      }

      logger.debug('passport authenticated');

      var action = req.param('action');
      logger.debug('processing action %s', action);
      if(action == 'invite') {
        res.redirect('/events');
      } else {
        req.login(user, function (err) {
          if (err) {
            logger.debug('LOGIN ERROR:');
            logger.debug(err);
            return tryAgain();
          } else {
            logger.debug('user ready!');
            res.redirect('/events');
          }
        });
      }
    });
  },
  /**
   * Disconnect a passport from a user
   *
   * @param {Object} req
   * @param {Object} res
   */
  disconnect: function (req, res) {
    logger.debug("disconnect %s passport for current user", req.param('provider'));

    passport.disconnect(req, res, function(err, user)
    {
      var query
      if(err)
        query = new Buffer( JSON.stringify({ error: 'Error disconnecting accounts.' }) ).toString('base64')
      else
        query = new Buffer( JSON.stringify({ message: 'Success disconnecting accounts.' }) ).toString('base64')
      return res.redirect('/socialconnect?'+query);

    });
  },
  registeruser: function (req, res) {

    if (sails.config.passport.ldapauth) {
      return res.send(400, 'ldapSet')
    }

    const params = req.params.all()
    verifyGoogleReCaptcha(params.grecaptcha, (err) => {
      if (err) {
        return res.send(err.statusCode, err.message)
      }

      if (!params.name) {
        return res.send(400, 'You must provide a name')
      }

      if (!params.username) {
        return res.send(400, 'You must select a username');
      }

      if (!params.email) {
        return res.send(400, 'You must select an email');
      }

      User.findOne({
        or: [
          {email: params.email},
          {username: params.username}
        ]
      }).exec((error,user) => {
        if (user) {
          if(user.enabled) {
            if(user.username == params.username)
              return res.send(400, 'usernameTaken');
            if(user.email == params.email)
              return res.send(400, 'emailTaken');
          } else {
            passport.sendUserActivationEmail( req.user, user, err => {
              if(err) {
                logger.error(err);
                return res.send(400, 'sendActivationEmailError');
              } else return res.json({message: 'success'});
            });
          }
        } else {
          passport.registerUser(req, res, function(err, user) {
            if(err) {
              logger.error(err);
              var errMsg = 'registerError'
              if(err.code && err.code == 'CredentialsError')
                errMsg = 'sendUserRegistrationEmailError'
              return res.send(400, errMsg);
            } else return res.json({message: 'success'});
          });
        }
      });
    })
  },
  checkUsernameActivation (req, res) {
    var username = req.query.username;
    var token = req.query.token;
    User.findOne({invitation_token: token})
    .exec(function(err, user) {
      if (err) return res.send(500, err)
      if (!user) return res.send(400)
      User.findOne({
        username: username,
      }, (err, user) => {
        if (err) return res.send(500, err)
        if (user) return res.send(400, 'Username already in use.')
        return res.send(201)
      })
    });
  },
  verifyInvitationToken (req, res) {
    User.findOne({invitation_token: req.query.invitation_token})
    .exec(function(err, user) {
      if (err) return res.send(500, err)
      if (!user) return res.send(400)
      return res.json({username: user.username, email: user.email, invitation_token: user.invitation_token, credential: user.credential})
    });
  },
  activateUser (req, res) {
    return passport.activateUser(req, res, function (err, user){
      if(err) {
        return res.send(err.statusCode||500, err)
      }
      if(!user){
        return res.send(400, 'Cannot activate user, user not found.');
      }

      req.login(user, function (err) {
        if (err) {
          logger.error('LOGIN ERROR:')
          logger.error('%o',err);
          return res.send(500, err)
        } else {
          logger.debug('user logged in. issuing access token')
          const accessToken = jwtoken.issue({ user_id: user.id })
          return res.send(200, {
            access_token: accessToken
          })
        }
      })
    });
  },
  /**
   * @route /auth/login
   * @param {Object} req
   * @param {Object} res
   */
  login (req, res) {
    const loginLocal = function () {
      passport.authenticate('local', function (err, user) {
        if (err) return res.send(500, err)
        if (!user) return res.send(400, 'Invalid credentials')
        if (!user.enabled) {
          passport.sendUserActivationEmail(req.user, user, err => {
            if (err) {
              logger.error(err)
              return res.send(400, 'Error re sending activation email.')
            } else {
              return res.send(400, {error: 'inactiveUser'})
            }
          })
        } else {
          logger.debug('passport authenticated via local strategy')
          req.login(user, function (err) {
            if (err) {
              logger.error('LOGIN ERROR:')
              logger.error('%o', err)
              return res.send(500, err)
            } else {
              logger.debug('user logged in. issuing access token')
              const accessToken = jwtoken.issue({ user_id: user.id })
              return res.send(200, {
                access_token: accessToken
              })
            }
          })
        }
      })(req, res, req.next)
    }

    if (sails.config.passport.ldapauth) {
      passport.authenticate('ldapauth', function (err, user, info) {
        if (err) {
          logger.error('LOGIN ERROR:')
          logger.error(err)
          return loginLocal()
        }

        if (!user) {
          // Invalid user or password
          logger.error('Invalid LDAP credentials.')
          return loginLocal()
        }

        logger.debug('passport authenticated via LDAP')
        req.login(user, function (err) {
          if (err) {
            logger.error('LOGIN ERROR:')
            logger.error('%o', err)
            return res.send(500, err)
          } else {
            logger.debug('user logged in. issuing access token')
            const accessToken = jwtoken.issue({ user_id: user.id })
            return res.send(200, {
              access_token: accessToken,
              login_type: 'ldap'
            })
          }
        })
      })(req, res, req.next)
    } else {
      loginLocal()
    }
  },
  //callback for login
  socialCallback(req, res) {
    var strategies = sails.config.passport;
    var provider = req.param('provider');
    var options = {}

    if (strategies[provider].options.hasOwnProperty('callbackURLLogin')) {
      options.callbackURL = strategies[provider].options.callbackURLLogin;
    }

    passport.authenticate(provider, options, function (err, response){
      var query
      var msg = "Login error, please try again later."
      if(err) {
        logger.error('SOCIAL LOGIN ERROR:')
        logger.error(err)

        if(err.message == 'usernotfound') {
          msg = "Login error, email does not match an existent account."
          query = new Buffer( JSON.stringify({ error: msg }) ).toString('base64')
          return res.redirect('/sociallogin?'+query);
        }

        if(err.message == 'userinactive') {
          msg = "Login error, user account is not activated."
          query = new Buffer( JSON.stringify({ error: msg }) ).toString('base64')
          return res.redirect('/sociallogin?'+query);
        }

        query = new Buffer( JSON.stringify({ error: msg }) ).toString('base64')
        return res.redirect('/sociallogin?'+query);
      }

      logger.debug('passport authenticated');
      req.login(response.user, function (err) {
        if (err) {
          logger.error('LOGIN ERROR:');
          logger.error(err);
          return res.redirect('/login');
        } else {
          logger.debug('user logged in. issuing access token')
          const accessToken = jwtoken.issue({ user_id: response.user.id })
          var queryToken = new Buffer( JSON.stringify({ access_token: accessToken }) ).toString('base64')
          return res.redirect('/sociallogin?'+queryToken);
        }
      });
    })(req, res, req.next);
  },
  //callback for connect
  socialConnectCallback(req, res) {
    var strategies = sails.config.passport;
    var provider = req.param('provider');
    var options = {}

    if (strategies[provider].options.hasOwnProperty('callbackURLConnect')) {
      options.callbackURL = strategies[provider].options.callbackURLConnect;
    }

    passport.authenticate(provider, options, function (err, response){
      var query
      var msg = "Error connecting accounts, please try again later."
      if(err) {
        logger.error('SOCIAL CONNECT ERROR:')
        logger.error('%o',err)

        if(err.message == 'usernotfound') {
          msg = "Error connecting accounts, accounts emails doesn't match."
          query = new Buffer( JSON.stringify({ error: msg }) ).toString('base64')
          return res.redirect('/socialconnect?'+query);
        }

        query = new Buffer( JSON.stringify({ error: msg }) ).toString('base64')
        return res.redirect('/socialconnect?'+query);
      }

      query = new Buffer( JSON.stringify({ message: 'Success connecting accounts.' }) ).toString('base64')
      return res.redirect('/socialconnect?'+query);

    })(req, res, req.next);
  },
  verifySocialToken(req, res) {
    var params = req.params.all();
    if(!params.email) return res.send(400,{message:'Missing social credentials.'});
    if(!params.idToken) return res.send(400,{message:'Missing social credentials.'});
    var auth = new GoogleAuth;
    var client = new auth.OAuth2(CLIENT_ID, '', '');

    client.verifyIdToken(params.idToken, CLIENT_ID, function(err, login) {
      if (err) {
        logger.error('LOGIN ERROR:');
        logger.error(err);
        return res.send(400,{message:'Invalid social credentials.'})
      }
      var payload = login.getPayload();
      if(!payload.sub) {
        logger.error('LOGIN ERROR:');
        logger.error('%o',err);
        return res.send(400,{message:'Invalid social credentials.'})
      }

      passport.authenticate('google-mobile', function (err, user) {
        if (err) return res.send(err.statusCode, err)
        if (!user) return res.send(400,{message:'Invalid social credentials.'})
        logger.debug('passport authenticated')
        passport.connectSocialMobile('google-mobile', payload.sub, user, function(err, user){
          if (err) {
            logger.error('LOGIN ERROR:')
            logger.error(err);
            return res.send(500, err)
          }
          req.login(user, function (err) {
            if (err) {
              logger.error('LOGIN ERROR:')
              logger.error(err);
              return res.send(500, err)
            } else {
              logger.debug('user logged in. issuing access token')
              const accessToken = jwtoken.issue({ user_id: user.id })
              return res.send(200, {
                access_token: accessToken
              })
            }
          })
        });
      })(req,res,req.next)
    });
  }
}

const verifyGoogleReCaptcha = (response, callback) => {
  if (!response) {
    let err = new Error('grecaptcha required')
    err.statusCode = 400
    return callback(err)
  }

  const config = sails.config.grecaptcha
  const secret = config.v2_secret
  const url = config.url

  request.post({
    url,
    form : { secret, response }
  }, (err, http, body) => {
    if (err) {
      return callback(err)
    }

    try {
      let json = JSON.parse(body)
      if (json.success === true) {
        logger.log('captch verification success')
        return callback()
      }

      err = new Error('grecaptcha verification failed')
      err.statusCode = 400
      return callback(err)
    } catch (e) {
      logger.error(e.message)

      err = new Error('grecaptcha verification failed')
      err.statusCode = 500
      return callback(err)
    }
  })
}
