import App from 'ampersand-app'

import Event from 'models/event'
import Webhook from 'models/webhook'
import Task from 'models/task'
import Resource from 'models/resource'
import Job from 'models/job'

module.exports = () => {
  App.extend({
    Models: {
      Event,
      Task,
      Job,
      Resource,
      Webhook
    }
  })
}
