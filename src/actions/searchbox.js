const logger = require('lib/logger')('actions:searchbox')

export default {
  search (pattern) {
    App.state.searchbox.search = pattern
    logger.log('searching')
  },
  clear () {
    App.state.searchbox.search = ''
    logger.log('search ended')
  }
}
