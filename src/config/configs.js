'use strict'

const defaultConfigs = {
  env: 'default',
  app_url: 'http://localhost:6080',
  socket_url: 'http://localhost:6080',
  api_url: 'http://localhost:6080/apiv2',
  api_v3_url: 'http://localhost:6080/apiv3',
  supervisor_api_url: 'http://localhost:60080',
  session: {
    refresh_interval: 1000 * 60 * 30
  },
  dashboard: {
    upandrunningSign: true
  },
  agentBinary:{
    url: 'https://s3.amazonaws.com/theeye.agent/TheEyeWinServiceInstaller.zip',
    name: 'TheEyeWinServiceInstaller.zip'
  }
}

const configs = {
  default: defaultConfigs,

  local: Object.assign({}, defaultConfigs, {
    env: 'local',
    dashboard: {
      //upandrunningSign: false
    }
  }),

  // cloud development enviroment
  development : Object.assign({}, defaultConfigs, {
    env: 'development',
    app_url: 'https://development.theeye.io',
    socket_url: 'https://development.theeye.io',
    api_url: 'https://development.theeye.io/apiv2',
    api_v3_url: 'https://development.theeye.io/apiv3',
    supervisor_api_url: 'https://supervisor.development.theeye.io',
  }),

  // cloud staging enviroment
  staging : Object.assign({}, defaultConfigs, {
    env: 'staging',
    app_url: 'https://staging.theeye.io',
    socket_url: 'https://staging.theeye.io',
    api_url: 'https://staging.theeye.io/apiv2',
    api_v3_url: 'https://staging.theeye.io/apiv3',
    supervisor_api_url: 'https://supervisor.staging.theeye.io',
  }),

  // cloud production enviroment
  production : Object.assign({}, defaultConfigs, {
    env: 'production',
    app_url: 'https://app.theeye.io',
    socket_url: 'https://app.theeye.io',
    api_url: 'https://app.theeye.io/apiv2',
    api_v3_url: 'https://app.theeye.io/apiv3',
    supervisor_api_url: 'https://supervisor.theeye.io',
  })
}

module.exports = configs
