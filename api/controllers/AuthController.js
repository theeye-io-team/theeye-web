var debug = require('debug')('eye:web:controller:auth');
var AuthController = {
  /**
   * Render the login page
   *
   * The login form itself is just a simple HTML form:
   *
   *  <form role="form" action="/auth/local" method="post">
   *    <input type="text" name="identifier" placeholder="Username or Email">
   *    <input type="password" name="password" placeholder="Password">
   *    <button type="submit">Sign in</button>
   *  </form>
   *
   * You could optionally add CSRF-protection as outlined in the documentation:
   * http://sailsjs.org/#!documentation/config.csrf
   *
   * A simple example of automatically listing all available providers in a
   * Handlebars template would look like this:
   *
   *  {{#each providers}}
   *    <a href="/auth/{{slug}}" role="button">{{name}}</a>
   *  {{/each}}
   *
   * @param {Object} req
   * @param {Object} res
   */
  login: function (req, res) {
    if(req.user) return res.redirect('/events');

    var strategies = sails.config.passport;
    var providers  = {};

    // Get a list of available providers for use in your templates.
    Object.keys(strategies).forEach(function (key) {
      if (key === 'local') return;

      providers[key] = {
        name: strategies[key].name,
        slug: key
      };
    });

    // Render the `auth/login.ext` view
    res.view({
      providers: providers,
      errors: req.flash('error')
    });
  },
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
  logout: function (req, res) {
    //delete the active customer for the session
    delete(req.session.customer);

    req.logout();
    res.redirect('/login');
  },
  /**
   * Render the registration page
   *
   * Just like the login form, the registration form is just simple HTML:
   *
   <form role="form" action="/auth/local/register" method="post">
   <input type="text" name="username" placeholder="Username">
   <input type="text" name="email" placeholder="Email">
   <input type="password" name="password" placeholder="Password">
   <button type="submit">Sign up</button>
   </form>
   *
   * @param {Object} req
   * @param {Object} res
   */
  register: function (req, res) {
    res.view({
      errors: req.flash('error')
    });
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
   * Render the activate page
   *
   * Form for user account activation
   *
   * @param {Object} req
   * @param {Object} res
   */
  activate: function (req, res) {
    var token = req.query.token;
    User.findOne({invitation_token: token}).exec(function(err, user)
    {
      if(err || !user)
      {
        res.redirect('/events');
      }
      else
      {
        res.view({
          errors: req.flash('error'),
          token: token,
          user: user
        });
      }
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
  updateLocalPassport: function (req, res)
  {
    sails.log.debug("update local passport password");

    passport.updateLocalPassport(req, res, function(err)
    {
      if(err)
        return res.send(500, err.toString())
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
        case 'activate':
          res.redirect('/activate?token='+encodeURIComponent(req.query.token));
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
        return tryAgain();
      }

      if(!user){
        sails.log.debug('authentication error %s user %s', err, user);
        return tryAgain();
      }

      sails.log.debug('passport authenticated');

      var action = req.param('action');
      sails.log.debug('processing action %s', action);
      if(action != 'invite')
      {
        req.login(user, function (err)
        {
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
      else res.redirect('/events');
    });
  },
  /**
   * Disconnect a passport from a user
   *
   * @param {Object} req
   * @param {Object} res
   */
  disconnect: function (req, res)
  {
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
  }
};

module.exports = AuthController;
