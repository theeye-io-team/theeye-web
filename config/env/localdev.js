var dbName = 'theeye';
module.exports = {
  application: {
    baseUrl : "http://0.0.0.0:6080",
    port : 6080,
    environment : 'development',
    secret : '692fc164a0c06a9fd02575cf17688c9e',
    client_id: 'theeye.io',
    client_secret: 'celintocateyente'
  },
  connections: {
    mongo: {
      adapter: 'sails-mongo',
      host: 'localhost',
      port: 27017,
      database: dbName
    }
  },
  session: {
    secret: '692fc164a0c06a9fd02575cf17688c9e',
    collection: 'web_session',
    adapter: 'mongo',
    host: 'localhost',
    port: 27017,
    db: dbName,
  },
  mailer: {
    from: 'TheEye.io <jailbirt@interactar.com>',
    replyTo: 'Support <jailbirt@interactar.com>',
    only_support: false,
    include_support_bcc: false,
    support: [ 'nobody@interactar.com' ],
    invitation: 'contact@theeye.io'
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
    url: 'http://localhost:60080',
    port: 60080,
    palancas: {
      resource : 'job'
    }
  }
};
