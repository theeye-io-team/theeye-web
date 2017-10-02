module.exports = {
  env: 'development',
  app_url: 'http://localhost:6080',
  socket_url: 'http://localhost:6080',
  api_url: 'http://localhost:6080/apiv2',
  supervisor_api_url: 'http://localhost:60080',
  session: {
    refresh_interval: 1000 * 60 * 30
  }
}
