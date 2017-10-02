module.exports = {
  default: {
    env: 'development',
    app_url: 'http://localhost:6080',
    socket_url: 'http://localhost:6080',
    api_url: 'http://localhost:6080/apiv2',
    supervisor_api_url: 'http://localhost:60080',
    session: {
      refresh_interval: 1000 * 60 * 30
    }
  },

  // cloud development enviroment
  development : {
    env: 'development',
    app_url: 'https://development.theeye.io',
    socket_url: 'https://development.theeye.io',
    api_url: 'https://development.theeye.io/apiv2',
    supervisor_api_url: 'https://supervisor.development.theeye.io',
    session: {
      refresh_interval: 1000 * 60 * 30
    }
  },

  // cloud staging enviroment
  staging : {
    env: 'staging',
    app_url: 'https://staging.theeye.io',
    socket_url: 'https://staging.theeye.io',
    api_url: 'https://staging.theeye.io/apiv2',
    supervisor_api_url: 'https://supervisor.staging.theeye.io',
    session: {
      refresh_interval: 1000 * 60 * 30
    }
  },

  // cloud production enviroment
  production : {
    env: 'production',
    app_url: 'https://theeye.io',
    socket_url: 'https://theeye.io',
    api_url: 'https://theeye.io/apiv2',
    supervisor_api_url: 'https://supervisor.theeye.io',
    session: {
      refresh_interval: 1000 * 60 * 30
    }
  }
}
