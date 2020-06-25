export default {
  grecaptcha: {
    sitekey: '6LfaIrsUAAAAAKmZPeN5ZqmFDvJZLEdtK0dev2eV',
  },
  docs: 'https://documentation.theeye.io',
  request_timeout: 30000,
  landing_page_url: 'https://theeye.io',
  env: 'default',
  app_url: 'http://localhost:6080',
  socket_url: 'http://localhost:6080',
  api_url: 'http://localhost:6080/api',
  api_v3_url: 'http://localhost:6080/api',
  supervisor_api_url: 'http://127.0.0.1:60080',
  files: {
    max_upload_size: 750
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
  lc_url: 'https://assets.theeye.io/production/bugtracking'
}
