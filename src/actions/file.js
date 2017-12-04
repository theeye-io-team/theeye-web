'use strict'

import App from 'ampersand-app'
// import XHR from 'lib/xhr'
// import bootbox from 'bootbox'
// import assign from 'lodash/assign'
// import after from 'lodash/after'
// import config from 'config'
import { Model as File } from 'models/file'

// const logger = require('lib/logger')('actions:files')

module.exports = {
  get (id) {
    const file = App.state.files.get(id)
    file.fetch()
  },
  update (id, data) {
    const file = App.state.files.get(id)
    file.set(data)
    file.data = file.encodeData(file.data)
    file.save()
  },
  create (data) {
    let file = new File(data)
    file.data = file.encodeData(data)
    file.save()
  },
  remove (id) {
    const file = App.state.files.get(id)
    file.destroy()
  }
}
