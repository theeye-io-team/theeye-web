import defaultConfigs from './default'

export default Object.assign({}, defaultConfigs, {
  env: 'production',
  app_url: 'https://app.theeye.io',
  socket_url: 'https://app.theeye.io',
  api_url: 'https://app.theeye.io/api',
  api_v3_url: 'https://app.theeye.io/api',
  supervisor_api_url: 'https://supervisor.theeye.io',
  components: {
    dynamic_form: {
      remote: {
        query_limit: 10
      }
    },
    login: {
      domain: {
        enabled: false
      },
      registration: {
        enabled: true
      },
      password_reset: {
        enabled: true
      },
      enterprise: {
        enabled: false
      },
      google: {
        enabled: true
      }
    },
    grecaptcha: {
      sitekey: '6LfZMM4cAAAAAImjGgjmOMHXj7p3Yr8JF4yMvkSt'
    },
    marketplace: {
      enabled: true,
      url: 'https://supervisor.theeye.io/marketplace'
    }
  }
})
