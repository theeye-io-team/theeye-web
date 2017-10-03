/* global passport, sails, User */
var debug = require('debug')('eye:web:controller:auth');
var GoogleAuth = require('google-auth-library');

const CLIENT_ID = sails.config.passport.google.options.clientID;

var AuthController = {
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
    if (!req.user) res.redirect('./login')
    req.logout()
    res.redirect('/login')
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
    sails.log.debug("update local passport password");

    passport.updateLocalPassport(req, res, function(err)
    {
      if(err)
        return res.send(500, err.toString());
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
  provider: function (req, res) {
    passport.endpoint(req, res);
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
        sails.log.error('fatal error');
        sails.log.error(err);
        return tryAgain(err);
      }

      if(!user){
        sails.log.debug('authentication error %s user %s', err, user);
        return tryAgain();
      }

      sails.log.debug('passport authenticated');

      var action = req.param('action');
      sails.log.debug('processing action %s', action);
      if(action == 'invite') {
        res.redirect('/events');
      } else {
        req.login(user, function (err) {
          if (err) {
            debug('LOGIN ERROR:');
            debug(err);
            return tryAgain();
          } else {
            sails.log.debug('user ready!');
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
    sails.log.debug("disconnect %s passport for current user", req.param('provider'));

    passport.disconnect(req, res, function(err, user)
    {
      if(err)
        res.view({ errors: req.flash('error') });
      else
        res.redirect ("/profile");
    });
  },
  //Link Between Accounts.
  connect: function (req, res) {
    passport.endpoint(req, res);
  },
  registeruser: function(req, res) {
    var params = req.params.all();
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
        passport.registerUser(req, res, function(err, user) {
          if(err) {
            sails.log.error(err);
            var errMsg = 'Error registering user.'
            if(err.code && err.code == 'CredentialsError')
              errMsg = 'Error sending registration email.'
            return res.send(400, errMsg);
          } else return res.json(user);
        });
      }
    });
  },
  inviteUser: function(req, res) {
    return passport.inviteUser(req, res, function(err, user) {
      if(err) {
        sails.log.error(err);
        return res.send(400, err);
      } else return res.send(201);
    });
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
          debug('LOGIN ERROR:')
          debug(err);
          return res.send(500, err)
        } else {
          debug('user logged in. issuing access token')
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
    passport.authenticate('local', function (err, user) {
      if (err) return res.send(500, err)
      if (!user) return res.send(400, 'Invalid credentials')
      sails.log.debug('passport authenticated')
      req.login(user, function (err) {
        if (err) {
          debug('LOGIN ERROR:')
          debug(err);
          return res.send(500, err)
        } else {
          debug('user logged in. issuing access token')
          const accessToken = jwtoken.issue({ user_id: user.id })
          return res.send(200, {
            access_token: accessToken
          })
        }
      })
    })(req,res,req.next)
  },
  socialCallback(req, res) {
    passport.callback(req, res, function (err, user){
      if(err){
        debug('SOCIAL LOGIN ERROR:')
        debug(err);
        return res.redirect('/login');
      }

      if(!user){
        debug('LOGIN ERROR: USER NOT FOUND')
        return res.redirect('/login');
      }

      sails.log.debug('passport authenticated');
      req.login(user, function (err) {
        if (err) {
          debug('LOGIN ERROR:');
          debug(err);
          return res.redirect('/login');
        } else {
          debug('user logged in. issuing access token')
          const accessToken = jwtoken.issue({ user_id: user.id })
          var queryToken = new Buffer( JSON.stringify({ access_token: accessToken }) ).toString('base64')
          res.redirect('/sociallogin?'+queryToken);
        }
      });
    });
  },
  verifySocialToken(req, res) {
    var params = req.params.all();
    if(!params.email) return res.send(400,{message:'Missing social credentials.'});
    if(!params.idToken) return res.send(400,{message:'Missing social credentials.'});
    var auth = new GoogleAuth;
    var client = new auth.OAuth2(CLIENT_ID, '', '');

    client.verifyIdToken(params.idToken, CLIENT_ID, function(err, login) {
      if (err) {
        debug('LOGIN ERROR:');
        debug(err);
        return res.send(400,{message:'Invalid social credentials.'})
      }
      var payload = login.getPayload();
      if(!payload.sub) {
        debug('LOGIN ERROR:');
        debug(err);
        return res.send(400,{message:'Invalid social credentials.'})
      }

      passport.authenticate('google-mobile', function (err, user) {
        if (err) return res.send(err.statusCode, err)
        if (!user) return res.send(400,{message:'Invalid social credentials.'})
        sails.log.debug('passport authenticated')
        passport.connectSocialMobile('google-mobile', payload.sub, user, function(err, user){
          if (err) {
            debug('LOGIN ERROR:')
            debug(err);
            return res.send(500, err)
          }
          req.login(user, function (err) {
            if (err) {
              debug('LOGIN ERROR:')
              debug(err);
              return res.send(500, err)
            } else {
              debug('user logged in. issuing access token')
              const accessToken = jwtoken.issue({ user_id: user.id })
              return res.send(200, {
                access_token: accessToken
              })
            }
          })
        });
      })(req,res,req.next)
    });
  },
}

module.exports = AuthController;
