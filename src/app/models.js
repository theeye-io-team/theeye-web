import App from 'ampersand-app'

import Event from 'models/event'
import Webhook from 'models/webhook'
import Task from 'models/task'
import Resource from 'models/resource'
import Job from 'models/job'
import User from 'models/user'
import Token from 'models/token'
import Indicator from 'models/indicator'
import Customer from 'models/customer'
import HostGroup from 'models/hostgroup'

module.exports = () => {
  App.extend({
    Models: {
      Event,
      Task,
      Job,
      Resource,
      Webhook,
      Indicator,
      User,
      Customer,
      Token,
      HostGroup
    }
  })
}
