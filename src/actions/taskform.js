
import App from 'ampersand-app'

const logger = require('lib/logger')('actions:taskform')

module.exports = {
  setFile (data) {
    App.state.taskForm.file = data
  },
  clearFile () {
    App.state.taskForm.file = {}
  }
}
