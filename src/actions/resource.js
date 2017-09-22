import App from 'ampersand-app'
const logger = require('lib/logger')('actions:resource')

module.exports = {
  update (data) {
    var model = App.state.resources.get(data.id)
    if (!model) {
      logger.error('resource not found')
      logger.error(model)
      return
    }

    logger.log('resource updated')
    model.set(data)
    App.state.resources.sort()
  },
  edit (id) {
    window.location = "/admin/monitor#search=" + id
  },
  workflow (id) {
    window.location = '/admin/workflow?node=' + id
  }
}
