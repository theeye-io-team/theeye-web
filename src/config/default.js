export default {
  env: 'default',
  app_url: 'http://localhost:6080',
  socket_url: 'http://localhost:6080',
  api_url: 'http://localhost:6080/api',
  api_v3_url: 'http://localhost:6080/api',
  supervisor_api_url: 'http://127.0.0.1:60080',
  supervisor_api_version: '~2',
  docs: 'https://documentation.theeye.io',
  request_timeout: 30000,
  landing_page_url: 'https://theeye.io',
  files: {
    max_upload_size: 5120
  },
  session: {
    refresh_interval: 1000 * 60 * 30
  },
  dashboard: {
    upandrunningSign: true
  },
  agentBinary: {
    url: 'https://s3.amazonaws.com/theeye.agent/TheEyeWinServiceInstaller.zip',
    name: 'TheEyeWinServiceInstaller.zip'
  },
  lc_url: 'https://assets.theeye.io/production/bugtracking',
  components: {
    dynamic_form: {
      remote: {
        query_limit: 10
      }
    },
    login: {
      registration: {
        enabled: true
      },
      password_reset: {
        enabled: true 
      },
      domain: {
        enabled: false
      },
      enterprise: {
        enabled: false
      },
      google: {
        enabled: false
      }
    },
    grecaptcha: {
      sitekey: ''
    },
    marketplace: {
      enabled: true,
      url: 'http://localhost:60080/marketplace'
    }
  }
}
