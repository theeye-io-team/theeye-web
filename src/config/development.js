import defaultConfigs from './default'

export default Object.assign({}, defaultConfigs, {
  env: 'development',
  app_url: 'https://development.theeye.io',
  socket_url: 'https://development.theeye.io',
  api_url: 'https://development.theeye.io/api',
  api_v3_url: 'https://development.theeye.io/api',
  supervisor_api_url: 'https://supervisor.development.theeye.io',
})
