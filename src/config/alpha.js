import defaultConfigs from './default'

export default Object.assign({}, defaultConfigs, {
  env: 'alpha',
  app_url: 'https://alpha.theeye.io',
  socket_url: 'https://alpha.theeye.io',
  api_url: 'https://alpha.theeye.io/api',
  api_v3_url: 'https://alpha.theeye.io/api',
  supervisor_api_url: 'https://supervisor-alpha.theeye.io:60080',
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
        enabled: true
      }
    },
    grecaptcha: {
      sitekey: '6LfaIrsUAAAAAKmZPeN5ZqmFDvJZLEdtK0dev2eV'
    }
  }
})
