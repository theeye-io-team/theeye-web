import loggerModule from 'lib/logger'; const logger = loggerModule('actions:searchbox')
import App from 'ampersand-app'

export default {
  search (pattern) {
    if (pattern === App.state.searchbox.search) { return }
    App.state.searchbox.search = pattern
    logger.log('searching')
  },
  findMatches (pattern) {
    App.state.searchbox.findMatches(pattern)
  },
  clear () {
    App.state.searchbox.search = ''
    logger.log('search ended')
  },
  setMatches (matches) {
    App.state.searchbox.matches = matches
  },
  clearMatches () {
    App.state.searchbox.clearMatches()
  },
  addRowsViews (elements) {
    App.state.searchbox.rowsViews = App.state.searchbox.rowsViews.concat(elements)
  },
  resetRowsViews (elements) {
    App.state.searchbox.rowsViews = elements
  },
  emptyRowsViews () {
    App.state.searchbox.rowsViews = []
  },
  endSearch () {
    App.state.searchbox.endSearch()
    App.state.searchbox.clearMatches()
  },
  clearResults () {
    App.state.searchbox.clearResults()
  }
}
