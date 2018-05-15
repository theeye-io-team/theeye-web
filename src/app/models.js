import App from 'ampersand-app'

import Event from 'models/event'
import Webhook from 'models/webhook'
import Task from 'models/task'
import Resource from 'models/resource'

module.exports = () => {
  App.extend({
    Collections: {
      Tasks: Task.Collection,
      Resource: Resource.Collection,
      Webhook: Webhook.Collection,
      Events: Event.Collection
    },
    Models: {
      Event: Event.Model,
      Task: {
        Script: Task.Script,
        Scraper: Task.Scraper
      },
      Monitor: Resource.Monitor,
      Resource: Resource.Model,
      Webhook: Webhook.Model
    }
  })
}
