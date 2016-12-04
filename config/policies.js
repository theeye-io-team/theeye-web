module.exports.policies = {
  '/':true,
  '*':[
    'sessionAuth',
    'passport', 
    'isAllowed', 
    'hasCustomer',
    'supervisorInitializer'
  ],
  PasswordController: {
    '*':['noSession'],
  },
  AuthController: {
    '*':'passport',
  },
  ContactController: {
    '*':['noSession'],
  },
  EventsController: {
    'update':['noSession'],
  },
  PalancaController: {
    'update':['noSession'],
  },
  HostStatsController: {
    'update':['noSession'],
  }
};
