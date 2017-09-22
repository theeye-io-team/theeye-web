const logger = require('lib/logger')('actions:searchbox')

module.exports = {
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
