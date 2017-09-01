const logger = require('lib/logger')('actions:searchbox')

export default {
  search (pattern) {
    if (pattern===App.state.searchbox.search) {
      return this.clear()
    }
    App.state.searchbox.search = pattern
    logger.log('searching')
  },
  clear () {
    App.state.searchbox.search = ''
    logger.log('search ended')
  }
}
