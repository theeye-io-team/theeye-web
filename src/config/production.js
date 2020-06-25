import defaultConfigs from './default'

export default Object.assign({}, defaultConfigs, {
  grecaptcha: {
    sitekey: '6LfaIrsUAAAAAKmZPeN5ZqmFDvJZLEdtK0dev2eV',
  },
  env: 'production',
  app_url: 'https://app.theeye.io',
  socket_url: 'https://app.theeye.io',
  api_url: 'https://app.theeye.io/api',
  api_v3_url: 'https://app.theeye.io/api',
  supervisor_api_url: 'https://supervisor.theeye.io'
})
