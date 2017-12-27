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
  'get    /connect/:provider' : 'AuthController.socialConnect',
  'get    /disconnect/:provider' : 'AuthController.disconnect',
  'get    /auth/:provider' : 'AuthController.socialAuth',
  // 'get    /auth/:provider/callback' : 'AuthController.callback',
  'get    /auth/:provider/callback' : 'AuthController.socialCallback',
  'get    /auth/:provider/connectcallback' : 'AuthController.socialConnectCallback',
  'get    /checkusernameactivation'  : 'AuthController.checkUsernameActivation',
  'post   /auth/local/update' : 'AuthController.updateLocalPassport',
  'post   /auth/local' : 'AuthController.callback',
  'post   /auth/login' : 'AuthController.login',
  'post   /auth/verifysocialtoken' : 'AuthController.verifySocialToken',
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
  'post   /user/:id/registerdevicetoken'  : 'UserController.registerdevicetoken',
  'post   /user'  : 'UserController.create',
  'delete /user/:id' : 'UserController.remove',
  // Password Recovery
  'post   /password/resetmail':'PasswordController.sendResetMail',
  'put    /password/reset':'PasswordController.reset',
  'get    /verifypasswordresettoken'  : 'PasswordController.verifyPasswordResetToken',
  // most of hereunder routes, probably will be removed after migrating to API calls
  // CustomerController routes
  'get    /customer' : 'CustomerController.fetch',
  'get    /customer/agent' : 'CustomerController.getuseragent',
  'get    /customer/:id' : 'CustomerController.get',
  'put    /customer/:id' : 'CustomerController.edit',
  'put    /customer/:id/config' : 'CustomerController.editconfig',
  'post   /customer' : 'CustomerController.create',
  'delete /customer/:id' : 'CustomerController.remove',
  'post   /task/schedule': 'TasksController.schedule',
  'get    /task/:id/schedule': 'TasksController.getSchedule',
  'delete /task/:id/schedule/:scheduleId': 'TasksController.cancelSchedule',
  'get    /script/:id' : 'ScriptController.get',
  'post   /script' : 'ScriptController.create',
  'put    /script/:id' : 'ScriptController.update',
  'post   /admin/script/download' : 'ScriptController.downloadPublicScript',
  'get   /script/example/:extension' : 'ScriptController.getExample',
  'get    /resource/:id' : 'ResourceController.get',
  'post   /resource/:type?' : 'ResourceController.create',
  'put    /resource/:id' : 'ResourceController.update',
  'patch  /resource/:id/alerts' : 'ResourceController.updateAlerts',
  'delete /resource/:id' : 'ResourceController.destroy',
  // ContactController routes
  'post   /contact' : 'ContactController.contact',

  'post   /notification' : 'NotificationController.sendnotification',
  /*
   *
   * need migration to /src structure (SPA)
   *
   */
  'get /admin/monitor': 'ResourceController.index',
  'get /hoststats/:host': 'HostStatsController.index',
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
  // admin routes
  'get /admin/workflow':'WorkflowController.index',
  'get /admin/*':spaIndexRoute,
  'get /events':(req,res,next) => res.redirect('/dashboard'),
  'get /dashboard*':spaIndexRoute,
  'get /login':spaIndexRoute,
  'get /register':spaIndexRoute,
  'get /activate':spaIndexRoute,
  'get /sociallogin':spaIndexRoute,
  'get /socialconnect':spaIndexRoute,
  'get /passwordreset':spaIndexRoute,
  /*
   *
   * GENERIC API V2 ENDPOINTS. PROXY TO THE API SUPERVISOR
   *
   * USE BEARER AUTHENTICATION METHOD
   *
   */
  // SESSION
  'post /session/customer/:customer':'BearerController.currentCustomer',
  'post /session/refresh':'BearerController.refreshAccessToken',
  'get  /session/profile': 'BearerController.sessionProfile',
  // FILES & SCRIPTS
  'post /apiv2/file':'ApiV2Controller.filePut',
  'put /apiv2/file/:id':'ApiV2Controller.filePut',
  'get /apiv2/file/:id':'ApiV2Controller.fileGet',
  'delete /apiv2/file/:id': 'ApiV2Controller.remove',
  //'get /apiv2/file/:id/download':'ApiV2Controller.download',
  // TASK SCHEDULER
  'post /apiv2/task/schedule': 'ApiV2Controller.createSchedule',
  'get /apiv2/task/:id/schedule': 'ApiV2Controller.getSchedules',
  'delete /apiv2/task/:id/schedule/:scheduleId': 'ApiV2Controller.cancelSchedule',
  // GENERIC PROXIED ENDPOINTS
  'put /apiv2/:resource/:id*':'ApiV2Controller.update',
  'patch /apiv2/:resource/:id*':'ApiV2Controller.patch',
  'delete /apiv2/:resource/:id*':'ApiV2Controller.remove',
  'get /apiv2/:resource/:id*':'ApiV2Controller.get',
  'get /apiv2/:resource*':'ApiV2Controller.fetch',
  'post /apiv2/:resource*':'ApiV2Controller.create',
  //
  //
  // new Generic Proxied Endpoints. Supervisor API V3. without customer in the route
  //
  //
  'get /apiv3/:resource/:id*':'ApiV3Controller.get',
  'get /apiv3/:resource*':'ApiV3Controller.fetch',
  /*
   *
   * GENERIC API V1 ENDPOINTS. PROXY TO THE API SUPERVISOR
   *
   * USE COOKIES/SESSION AUTHENTICATION METHOD.
   *
   * OLD AND DEPRECATED
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
