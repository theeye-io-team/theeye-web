'use strict'

import App from 'ampersand-app'

const logger = require('lib/logger')('actions:tasks')

module.exports = {
  update (data) {
  },
  populate (task) {
    const script = task.script
    if (script !== undefined && !script.id) {
      script.id = task.script_id
      script.fetch()
    }
  }
}
