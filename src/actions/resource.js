import App from 'ampersand-app'
const logger = require('lib/logger')('actions:resource')

export default {
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
  }
}
