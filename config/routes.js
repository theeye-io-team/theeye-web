// If a request to a URL doesn't match any of the custom routes above, it is matched
// against Sails route blueprints.  See `config/blueprints.js` for configuration options
// and examples.

module.exports.routes = {
  //Home
  '/' : function(req, res, next){
    if (req.user) {
      return res.redirect('/events');
    }
    if (sails.config.application.landingPage === false) {
      return res.redirect('/login');
    }
    res.sendfile(sails.config.appPath + '/assets/theeye-landpage/index.html');
  },
  '/mantenimiento': { view: 'mantenimiento' },
  //AuthController routes
  //'get /register' : 'AuthController.register',
  'get    /login' : 'AuthController.login',
  'get    /logout' : 'AuthController.logout',
  'get    /invite' : 'AuthController.invite',
  'get    /activate' : 'AuthController.activate',
  'get    /connect/:provider' : 'AuthController.provider',
  'get    /disconnect/:provider' : 'AuthController.disconnect',
  'get    /auth/:provider' : 'AuthController.provider',
  'get    /auth/:provider/callback' : 'AuthController.callback',
  'post   /auth/local/update' : 'AuthController.updateLocalPassport',
  'post   /auth/local' : 'AuthController.callback',
  'post   /auth/local/:action' : 'AuthController.callback',
  // UserController routes
  'post   /setcustomer/:customer' : 'UserController.setcustomer',
  'get    /admin/user' : 'UserController.index',
  'get    /profile' : 'UserController.profile',
  'put    /user/:id/reinvite' : 'UserController.sendActivationLink',
  'get    /user'  : 'UserController.fetch',
  'get    /user/:id' : 'UserController.get',
  'put    /user/:id' : 'UserController.edit',
  'post   /user'  : 'UserController.create',
  'delete /user/:id' : 'UserController.remove',
  /**
   * Password Recovery
   */
  'post   /password/resetmail':'PasswordController.sendResetMail',
  'get    /password/resetform/:token':'PasswordController.resetForm',
  'put    /password/reset':'PasswordController.reset',
  /**
   * CustomerController routes
   */
  'get    /admin/customer' : 'CustomerController.index',
  'get    /customer' : 'CustomerController.fetch',
  'get    /customer/:id' : 'CustomerController.get',
  'put    /customer/:id' : 'CustomerController.edit',
  'post   /customer' : 'CustomerController.create',
  'delete /customer/:id' : 'CustomerController.remove',
  'get    /customer/:name/agent' : 'CustomerController.getUserAgent',
  //HostController routes
  'get    /hoststats/:host' : 'HostStatsController.index',
  //TaskController routes
  'get    /admin/task'                    : 'TasksController.index',
  'post   /task'                          : 'TasksController.create',
  'post   /task/schedule'                 : 'TasksController.schedule',
  'get    /task/:id?'                     : 'TasksController.get',
  'get    /task/:id/schedule'             : 'TasksController.getSchedule',
  'delete /task/:id/schedule/:scheduleId' : 'TasksController.cancelSchedule',
  'delete /task/:id?'                     : 'TasksController.destroy',
  'put    /task/:id?'                     : 'TasksController.update',
  //ScriptController routes
  'get    /admin/script' : 'ScriptController.index',
  'post   /admin/script/download' : 'ScriptController.downloadPublicScript',
  'get    /script/:id' : 'ScriptController.get',
  'get    /script' : 'ScriptController.fetch',
  'post   /script' : 'ScriptController.create',
  'delete /script/:id' : 'ScriptController.destroy',
  'put    /script/:id' : 'ScriptController.update',
  //ResourceController routes
  'get    /admin/monitor' : 'ResourceController.index',
  'get    /resource/:id' : 'ResourceController.get',
  'post   /resource/:type?' : 'ResourceController.create',
  'put    /resource/:id' : 'ResourceController.update',
  'patch  /resource/:id/alerts' : 'ResourceController.updateAlerts',
  'delete /resource/:id' : 'ResourceController.destroy',
  //ContactController routes
  'post   /invitation' : 'ContactController.invitation',
  // Template-HostGroups routes
  'get    /admin/hostgroup' : 'HostGroupController.index',
  'post   /admin/hostgroup' : 'HostGroupController.create',
  'get    /admin/hostgroup/:id' : 'HostGroupController.get',
  'put    /admin/hostgroup/:id' : 'HostGroupController.update',
  'delete /admin/hostgroup/:id' : 'HostGroupController.destroy',
  // TaskTemplate-HostGroups routes
  'put    /admin/hostgroup/:groupid/tasktemplate/:taskid' : 'HostGroupTaskTemplateController.update',
  'post   /admin/hostgroup/:groupid/tasktemplate' : 'HostGroupTaskTemplateController.create',
  'delete /admin/hostgroup/:groupid/tasktemplate/:taskid' : 'HostGroupTaskTemplateController.destroy',
  // MonitorTemplate-HostGroups routes
  'put    /admin/hostgroup/:groupid/monitortemplate/:monitorid' : 'HostGroupMonitorTemplateController.update',
  'post   /admin/hostgroup/:groupid/monitortemplate' : 'HostGroupMonitorTemplateController.create',
  'delete /admin/hostgroup/:groupid/monitortemplate/:monitorid' : 'HostGroupMonitorTemplateController.destroy',

  // temporary just for testing grouped monitors
  'get    /events/test' : 'EventsController.index',
  /**
   *
   * generic api endpoints
   *
   */
  'post /api/:resource':'ApiController.create',
  'put /api/:resource/:id':'ApiController.update',
  'delete /api/:resource/:id':'ApiController.remove',
  'get /api/:resource':'ApiController.fetch',
  'get /api/:resource/:id':'ApiController.get',
  // template only render
  'get /admin/webhook':'WebhookController.index',
  'get /dashboard':'DashboardController.index',
  'get /admin/workflow':'WorkflowController.index',
  'get /admin/scheduler':'SchedulerController.index',
};
