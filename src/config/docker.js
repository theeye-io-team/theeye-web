import defaultConfigs from './default'

export default Object.assign({}, defaultConfigs, {
  env: 'docker',
  app_url: 'http://localhost:6080',
  socket_url: 'http://localhost:6080',
  api_url: 'http://localhost:6080/api',
  api_v3_url: 'http://localhost:6080/api',
  supervisor_api_url: 'http://localhost:60080'
})
