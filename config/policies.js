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
    'registeruser': ['noSession'],
    'checkUsernameActivation': ['noSession'],
    'verifyToken': ['noSession'],
    '*': 'passport'
  },
  PasswordController: { '*': ['noSession'] },
  ContactController: { '*': ['noSession'] },
  // SNS receivers . will be deprecated soon
  EventsController: { 'update': ['noSession'] },
  // HostStatsController: { 'update':['noSession'], },
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
  MemberController: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ]
  },
  CustomerController: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ]
  },
  NotificationController: {
    '*': [
      'passportBearer',
      'isAllowed',
      'sessionCustomer',
      'supervisorInitializer'
    ],
    'create': ['noSession']
  },
  InboxController: {
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
