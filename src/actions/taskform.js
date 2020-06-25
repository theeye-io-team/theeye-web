
import App from 'ampersand-app'

import loggerModule from 'lib/logger'; const logger = loggerModule('actions:taskform')

export default {
  setFile (file) {
    App.state.taskForm.file = file
  },
  clearFile () {
    App.state.taskForm.file = {}
  }
}
