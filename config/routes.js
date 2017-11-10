// If a request to a URL doesn't match any of the custom routes above, it is matched
// against Sails route blueprints.  See `config/blueprints.js` for configuration options
// and examples.

const spaIndexRoute = (req,res,next) => {
  res.sendfile(sails.config.appPath + '/assets/index.html')
}

module.exports.routes = {
  // Home
  '/' : function (req, res, next) {
    if (req.user) {
      return res.redirect('/dashboard');
    }
    if (sails.config.application.landingPage === false) {
      return res.redirect('/login');
    }
    res.sendfile(sails.config.appPath + '/assets/landpage/index.html');
  },
  '/mantenimiento': { view: 'mantenimiento' },
  // AuthController routes
  'get    /logout' : 'AuthController.logout',
  // 'get    /invite' : 'AuthController.invite',
  //'get    /activate' : 'AuthController.activate',
  'get    /connect/:provider' : 'AuthController.provider',
  'get    /disconnect/:provider' : 'AuthController.disconnect',
  'get    /auth/:provider' : 'AuthController.provider',
  // 'get    /auth/:provider/callback' : 'AuthController.callback',
  'get    /auth/:provider/callback' : 'AuthController.socialCallback',
  'get    /checkusernameactivation'  : 'AuthController.checkUsernameActivation',
  'post   /auth/local/update' : 'AuthController.updateLocalPassport',
  'post   /auth/local' : 'AuthController.callback',
  'post   /auth/login' : 'AuthController.login',
  'post   /auth/verifysocialtoken' : 'AuthController.verifySocialToken',
  // 'post   /auth/inviteuser' : 'AuthController.inviteUser',
  'post   /auth/local/:action' : 'AuthController.callback',
  'post   /auth/activateuser' : 'AuthController.activateUser',
  'post   /registeruser'  : 'AuthController.registeruser',
  'get   /verifytoken'  : 'AuthController.verifyInvitationToken',
  // UserController routes
  'post   /setcustomer/:customer' : 'UserController.setcustomer',
  'get    /userpassport' : 'UserController.getuserpassport',
  'put    /user/:id/reinvite' : 'UserController.sendActivationLink',
  'get    /member' : 'MemberController.fetch',
  'post   /member' : 'MemberController.inviteMember',
  'delete /member/:id' : 'MemberController.removemember',
  'put    /member/:id' : 'MemberController.updatemembercredential',
  'get    /user'  : 'UserController.fetch',
  'get    /user/:id' : 'UserController.get',
  'put    /user/:id' : 'UserController.edit',
  'post   /user'  : 'UserController.create',
  'delete /user/:id' : 'UserController.remove',
  // Password Recovery
  'post   /password/resetmail':'PasswordController.sendResetMail',
  'put    /password/reset':'PasswordController.reset',
  'get    /verifypasswordresettoken'  : 'PasswordController.verifyPasswordResetToken',
  // most of hereunder routes, probably will be removed after migrating to API calls
  // CustomerController routes
  'get    /customer' : 'CustomerController.fetch',
  'get    /customer/:id' : 'CustomerController.get',
  'put    /customer/:id' : 'CustomerController.edit',
  'post   /customer' : 'CustomerController.create',
  'delete /customer/:id' : 'CustomerController.remove',
  'get    /customer/:name/agent' : 'CustomerController.getUserAgent',
  // TaskController routes
  'post   /task': 'TasksController.create',
  'post   /task/schedule': 'TasksController.schedule',
  'get    /task/:id?': 'TasksController.get',
  'get    /task/:id/schedule': 'TasksController.getSchedule',
  'delete /task/:id/schedule/:scheduleId': 'TasksController.cancelSchedule',
  'delete /task/:id?': 'TasksController.destroy',
  'put    /task/:id?': 'TasksController.update',
  // ScriptController routes
  'post   /admin/script/download' : 'ScriptController.downloadPublicScript',
  'get    /script/:id' : 'ScriptController.get',
  'get    /script' : 'ScriptController.fetch',
  'post   /script' : 'ScriptController.create',
  'delete /script/:id' : 'ScriptController.destroy',
  'put    /script/:id' : 'ScriptController.update',
  // ResourceController routes.
  'get    /resource/:id' : 'ResourceController.get',
  'post   /resource/:type?' : 'ResourceController.create',
  'put    /resource/:id' : 'ResourceController.update',
  'patch  /resource/:id/alerts' : 'ResourceController.updateAlerts',
  'delete /resource/:id' : 'ResourceController.destroy',
  // ContactController routes
  'post   /contact' : 'ContactController.contact',

  /*
   *
   * need migration to /src structure (SPA)
   *
   */
  'get /admin/monitor': 'ResourceController.index',
  'get /admin/script': 'ScriptController.index',
  'get /hoststats/:host': 'HostStatsController.index',
  'get /admin/oldtask': 'TasksController.index',
  /*
   *
   * all this endpoints are not handled by Sails at all.
   * has no policies and do not require credentials.
   * all must be validated on the UI
   *
   * old MVC views migration. return response with SPA index.html only
   * full javascript render.
   *
   */
  '/events': (req,res,next) => res.redirect('/dashboard'),
  'get /admin/workflow': 'WorkflowController.index',
  'get /admin/webhook': spaIndexRoute,
  'get /admin/scheduler': spaIndexRoute,
  'get /admin/hostgroup': spaIndexRoute,
  'get /admin/user' : spaIndexRoute,
  'get /admin/customer': spaIndexRoute,
  'get /admin/task': spaIndexRoute,
  'get /dashboard': spaIndexRoute,
  'get /login': spaIndexRoute,
  'get /register': spaIndexRoute,
  'get /activate': spaIndexRoute,
  'get /sociallogin': spaIndexRoute,
  'get /passwordreset':spaIndexRoute,

  /*
   *
   * GENERIC API V2 ENDPOINTS. PROXY TO THE API SUPERVISOR
   *
   * USE BEARER AUTHENTICATION METHOD
   *
   */
  'post /session/customer/:customer':'BearerController.currentCustomer',
  'post /session/refresh':'BearerController.refreshAccessToken',
  'get  /session/profile': 'BearerController.sessionProfile',
  'put /apiv2/file/:id':'ApiV2Controller.upload',
  'post /apiv2/file':'ApiV2Controller.upload',
  'get /apiv2/file/:id':'ApiV2Controller.download',
  'put /apiv2/:resource/:id*':'ApiV2Controller.update',
  'patch /apiv2/:resource/:id*':'ApiV2Controller.patch',
  'delete /apiv2/:resource/:id*':'ApiV2Controller.remove',
  'get /apiv2/:resource/:id*':'ApiV2Controller.get',
  'get /apiv2/:resource*':'ApiV2Controller.fetch',
  'post /apiv2/:resource*':'ApiV2Controller.create',
  /*
   *
   * GENERIC API V1 ENDPOINTS. PROXY TO THE API SUPERVISOR
   *
   * USE COOKIES/SESSION AUTHENTICATION METHOD
   *
   */
  'put /api/file/:id':'ApiController.upload',
  'post /api/file':'ApiController.upload',
  'get /api/file/:id':'ApiController.download',
  'put /api/:resource/:id*':'ApiController.update',
  'patch /api/:resource/:id*':'ApiController.patch',
  'delete /api/:resource/:id*':'ApiController.remove',
  'get /api/:resource/:id*':'ApiController.get',
  'get /api/:resource*':'ApiController.fetch',
  'post /api/:resource*':'ApiController.create',
}
