module.exports.policies = {
  '/': true,
  '*': [
    'hasSession',
    'passport',
    'isAllowed',
    'sessionCustomer',
    'setCookies',
    'supervisorInitializer'
  ],
  ApiV2Controller: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ]
  },
  // bearer session clients controllers
  BearerController: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ]
  },
  AuthController: {
    'registeruser':['noSession'],
    'checkUsernameActivation':['noSession'],
    'verifyToken':['noSession'],
    '*':'passport',
  },
  PasswordController: { '*':['noSession'], },
  ContactController: { '*':['noSession'], },
  // SNS receivers . will be deprecated soon
  EventsController: { 'update':['noSession'], },
  PalancaController: { 'update':['noSession'], },
  HostStatsController: { 'update':['noSession'], }
};
