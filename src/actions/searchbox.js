const logger = require('lib/logger')('actions:searchbox')
import App from 'ampersand-app'

module.exports = {
  search (pattern) {
    if (pattern === App.state.searchbox.search) {
      return
    }
    App.state.searchbox.search = pattern
    logger.log('searching')
  },
  clear () {
    App.state.searchbox.search = ''
    logger.log('search ended')
  },
  setMatches (matches) {
    App.state.searchbox.matches = matches
  },
  clearMatches () {
    App.state.searchbox.matches = []
  },
  addRowsViews (views) {
    App.state.searchbox.rowsViews = App.state.searchbox.rowsViews.concat(views)
  },
  resetRowsViews (views) {
    App.state.searchbox.rowsViews = views
  },
  emptyRowsViews () {
    App.state.searchbox.rowsViews = []
  },
  endSearch () {
    App.state.searchbox.rowsViews.forEach(row => row.show = true)
    this.clearMatches()
  },
  onRow (row, hit) {
    App.state.searchbox.trigger('onrow', {row, hit})
  }
}
