'use strict'

import App from 'ampersand-app'

const logger = require('lib/logger')('actions:tasks')

export default {
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
