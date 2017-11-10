import App from 'ampersand-app'

import Event from 'models/event'
import Webhook from 'models/webhook'
import Task from 'models/task'
import Monitor from 'models/monitor'

module.exports = () => {
  App.extend({
    Collections: {
      Tasks: Task.Collection,
      Monitor: Monitor.Collection,
      Webhook: Webhook.Collection,
      Events: Event.Collection
    },
    Models: {
      Event: Event.Model,
      Task: {
        Script: Task.Script,
        Scraper: Task.Scraper
      },
      Monitor: Monitor.Model,
      Webhook: Webhook.Model
    }
  })
}
