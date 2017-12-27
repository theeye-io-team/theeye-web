module.exports = {
	is_cluster: true, // is this the only web instance or there is more
  application: {
    baseUrl: "http://localhost:6080",
    port: 6080,
    environment: 'localdev',
    secret: '692fc164a0c06a9fd02575cf17688c9e',
    agentInstallerUrl: {
      linux: 'https://s3.amazonaws.com/theeye.agent/linux/setup.sh',
    },
    agentBinary:{
      url: 'https://s3.amazonaws.com/theeye.agent/theEyeInstallerx64.exe',
      name: 'theEyeInstallerx64.exe'
    },
    landingPage: true
  },
  auth: {
    secret: '692fc164a0c06a9fd02575cf17688c9e',
    expires: 2 * 60 * 60 // in seconds
  },
  connections: {
    mongo: {
      adapter: 'sails-mongo',
      host: '127.0.0.1',
      port: 27017,
      database: 'theeye'
    }
  },
  session: {
    secret: '692fc164a0c06a9fd02575cf17688c9e',
    adapter: 'mongo',
    host: '127.0.0.1',
    port: 27017,
    db: 'theeye',
    collection: 'web_session'
  },
  mailer: {
    from: 'TheEye.io <support@theeye.io>',
    replyTo: 'Support <support@theeye.io>',
    only_support: false,
    include_support_bcc: false,
    support: [],
    invitation: 'contact@theeye.io',
    transport: {
      type: "sendmail"
    }
  },
  passport: {
    local: {
      strategy: require('passport-local').Strategy,
      activateUrl: 'http://localhost:6080/activate?'
    },
    google: {
      name: 'Google',
      protocol: 'oauth2',
      strategy: require('passport-google-oauth').OAuth2Strategy,
      scope: ['profile', 'email'],
      options: {
        clientID: '714923395260-9jd45ige6gg86mffrvf419dvuh85360t.apps.googleusercontent.com',
        clientSecret: 'k6eNjkeiRriseEUgPBWlGiHr',
        callbackURLLogin: "http://localhost:6080/auth/google/callback",
        callbackURLConnect: "http://localhost:6080/auth/google/connectcallback"
      }
    }
  },
  supervisor: {
    client_id: '939e7ad87f616af22325a84b6192ba7974404160',
    client_secret: '4611b7a50f63c2bb259aa72e0b8b54ae54c326c6',
    url: 'http://127.0.0.1:60080',
    port: 60080,
    palancas: {
      resource: 'job'
    }
  },
	aws: {
		username: '',
		accessKeyId: '',
		secretAccessKey: '',
		region: ''
	},
  sns: {
		sockets_arn: '',
    push_notifications: {
      application_arn: ''
    }
  },
  //sockets: {
  //  adapter: 'redis',
  //  host: 'redis-prod.theeye.io',
  //  port: 6379,
  //  db: 'theeye-web'
  //},
}
