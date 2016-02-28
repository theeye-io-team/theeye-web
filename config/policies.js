module.exports.policies = {
  '/':true,
  '*':[
    'sessionAuth',
    'passport', 
    'isAllowed', 
    'hasCustomer',
    'supervisorInitializer'
  ],
  AuthController: {
    '*':'passport',
  },
  EventsController: {
    'update':['noSession'],
  },
  PalancaController: {
    'update':['noSession'],
  },
  HostStatsController: {
    'update':['noSession'],
  },
  ContactController: {
    'invitation':['noSession'],
  },
  UserController:{
    'retrievePassword':['noSession'],
  }
};
