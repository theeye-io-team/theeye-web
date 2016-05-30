var dbName = 'theeye';
module.exports = {
  application: {
    baseUrl : "http://0.0.0.0:6080",
    port : 6080,
    environment : 'development',
    secret : '692fc164a0c06a9fd02575cf17688c9e',
    client_id: '939e7ad87f616af22325a84b6192ba7974404160',
    client_secret: '4611b7a50f63c2bb259aa72e0b8b54ae54c326c6'
  },
  connections: {
    mongo: {
      adapter : 'sails-mongo',
      host : 'localhost',
      port : 27017,
      database : dbName
    }
  },
  session: {
    secret : '692fc164a0c06a9fd02575cf17688c9e',
    collection : 'web_session',
    adapter : 'mongo',
    host : 'localhost',
    port : 27017,
    db : dbName,
  },
  mailer: {
    from: 'TheEye.io <jailbirt@interactar.com>',
    replyTo: 'Support <jailbirt@interactar.com>',
    only_support: false,
    include_support_bcc: false,
    support: [],
    invitation: 'contact@theeye.io',
    transport: {
      /**
       * use aws email service
       * more options
       * https://github.com/andris9/nodemailer-ses-transport
       *
       **/
      "type":"ses",
      /**
      "options":{
        "accessKeyId":"",
        "secretAccessKey":"",
        "sessionToken":"",
        "region":"",
        "httpOptions":"",
        "rateLimit":"",
      }
      */
      /**
       * use google account
       * The account needs to be configured to allow "Less secure apps"
       *
      "type":"gmail",
       */
      /**
       * Must have:
       *
      "options":{
       "user":"cgastrell@interactar.com",
       "pass":"yourBigFurryPasswordHere"
      }
       */
      /**
       * use local sendmail smtp , with no options
       * "type":"sendmail",
       *
       * or smtp
       * more options
       * https://github.com/nodemailer/nodemailer-smtp-transport
       *
       * "type":"smtp",
       * "options":{
       *   "port":"",
       *   "host":"",
       *   "secure":"",
       *   "auth":"",
       *   "ignoreTLS":"",
       *   "name":"",
       *   "localAddress":"",
       *   "connectionTimeout":"",
       *   "greetingTimeout":"",
       *   "socketTimeout":"",
       *   "logger":"",
       *   "debug":"",
       *   "authMethod":"",
       *   "tls":"",
       * }
       */
    }
  },
  passport: {
    local: {
      strategy: require('passport-local').Strategy,
      activateUrl: 'http://0.0.0.0:6080/activate?'
    },
    google: {
      name: 'Google',
      protocol: 'oauth2',
      strategy: require('passport-google-oauth').OAuth2Strategy,
      scope : ['profile', 'email'],
      options: {
        clientID : '718619105306-bhgv1ue1r2disr47pvm492r3fust0qee.apps.googleusercontent.com',
        clientSecret : 'bbeYqPLu6wxTWunGIBx-IPuP',
        callbackURL : "http://0.0.0.0:6080/auth/google/callback"
      }
    }
  },
  supervisor: {
    url: 'http://0.0.0.0:60080',
    port: 60080,
    palancas: {
      resource : 'job'
    }
  }
};
