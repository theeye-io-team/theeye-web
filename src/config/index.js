const nodeEnv = process.env.NODE_ENV
import loggerModule from 'lib/logger'
const logger = loggerModule('config')
const defaultConfig = require('./default').default
 
export default (() => {
  try {
    if (window.config) {
      logger.debug('window configuration found')
      return Object.assign({}, defaultConfig, window.config)
    } else {
      if (!nodeEnv && !window.env) {
        return defaultConfig
      } else {
        // specified via webpack build process
        let env = (window.env || nodeEnv)
        logger.debug('loading configuration for env %s', env)
        let config = require(`./${env}`).default
        return config
      }
    }
  } catch (err) {
    console.warn(err)
    console.log('using default config')
    return defaultConfig
  }
})()
