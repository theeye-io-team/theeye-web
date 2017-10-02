'use strict'
// specified via webpack build process
const env = process.env.NODE_ENV || 'default'
const configs = require('./configs')
const logger = require('lib/logger')('config')

logger.debug('reading configuration for env %s', env)
let config
if (configs.hasOwnProperty(env)) {
  config = configs[env]
} else {
  logger.warn('configuration not found. using default')
  config = configs.default
}

module.exports = config
