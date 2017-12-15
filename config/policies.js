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
  HostStatsController: { 'update':['noSession'], },
  NotificationController: { 'sendnotification':['noSession'], },
  //
  // bearer session clients controllers
  //
  BearerController: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ]
  },
  ApiV2Controller: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ]
  },
  ApiV3Controller: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ]
  }
}
