module.exports = {
  application: {
    baseUrl: 'http://127.0.0.1:6080',
    port: 6080, // internal port
    environment: '',
    secret: '692fc164a0c06a9fd02575cf17688c9e',
    agentInstallerUrl: {
      linux: 'https://s3.amazonaws.com/theeye.agent/linux/setup.sh',
      windows: 'https://s3.amazonaws.com/theeye.agent/windows/agent-installer.ps1'
    },
    agentBinary: {
      url: 'https://s3.amazonaws.com/theeye.agent/theEyeInstallerx64.exe',
      name: 'theEyeInstallerx64.exe'
    }
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
  sockets: {
    adapter: 'redis',
    host: '127.0.0.1',
    port: 6379,
    db: 'theeye-web'
  },
  mailer: {
    from: 'TheEye.io <support@theeye.io>',
    replyTo: 'Support <support@theeye.io>',
    only_support: false,
    include_support_bcc: false,
    support: [],
    invitation: 'contact@theeye.io',
    transport: {
      type: 'sendmail'
    }
  },
  passport: {
    local: {
      strategy: require('passport-local').Strategy,
      activateUrl: 'http://127.0.0.1:6080/activate?'
    },
    /**
     *
     * google oauth authentication config
     *
     */
    google: {
      name: 'Google',
      protocol: 'oauth2',
      strategy: require('passport-google-oauth').OAuth2Strategy,
      scope: ['profile', 'email'],
      options: {
        clientID: '714923395260-9jd45ige6gg86mffrvf419dvuh85360t.apps.googleusercontent.com',
        clientSecret: 'k6eNjkeiRriseEUgPBWlGiHr',
        callbackURLLogin: 'http://localhost:6080/auth/google/callback',
        callbackURLConnect: 'http://localhost:6080/auth/google/connectcallback'
      }
    },
    /**
     *
     * ldap authentication config
     * https://www.npmjs.com/package/passport-ldapauth
     *
     */
    // ldapauth: {
    //   provider: 'ActiveDirectory',
    //   customerName: 'ldapOrg',
    //   server: {
    //     url: '',
    //     bindDN: '',
    //     bindCredentials: '',
    //     searchBase: '',
    //     searchAttributes: ['objectSid', 'name', 'mail', 'sAMAccountName', 'memberOf'],
    //     searchFilter: '(sAMAccountName={{username}})'
    //   },
    //   fields: {
    //     id: 'sAMAccountName',
    //     name: 'name',
    //     username: 'sAMAccountName',
    //     email: 'mail',
    //     groups: 'memberOf'
    //   }
    // }
  },
  supervisor: {
    timeout: 10000,
    client_id: '939e7ad87f616af22325a84b6192ba7974404160',
    client_secret: '4611b7a50f63c2bb259aa72e0b8b54ae54c326c6',
    url: 'http://127.0.0.1:60080',
    port: 60080,
    incoming_secret: '77E0EAF3B83DD7A7A4004602626446EADED31BF794956FC9BBAD051FA5A25038', // supervisor incoming requests secret passphrase
    integrations: {
      autobot: {
        task_id: '5b57a27be79f800c3ff8b52d',
        task_customer: 'demo',
        task_exec_path: '/job/secret/06eb33aaff7a7c3d897311e7e30e0cb0d685a6574b86307032d9cd611ba1fdef?customer=demo'
      }
    }
  },
  /**
   *
   * this aws credentials provides SNS access
   *
   */
  aws: {
    username: '',
    accessKeyId: '',
    secretAccessKey: '',
    region: ''
  },
  sns: {
    debug: false,
    push_notifications: {
      android: '',
      ios: ''
    }
  },
  /**
   *
   * redis options to pass directly to node redis client
   * https://www.npmjs.com/package/redis
   *
   */
  redis: {
    prefix: 'app_',
    host: '127.0.0.1',
    port: 6379
  },
  /**
   *
   * google recaptcha
   *
   */
  grecaptcha: {
    v2_secret: null,
    v3_secret: null,
    url: 'https://www.google.com/recaptcha/api/siteverify'
  },
  auth: {
    secret: '692fc164a0c06a9fd02575cf17688c9e',
    expires: 3 * (60 * 60) // in seconds
  }
}
