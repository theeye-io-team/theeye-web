'use strict'

import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
import XHR from 'lib/xhr'
import config from 'config'

const Resources = require('models/resource/index').Collection
const Tasks = require('models/task/index').Collection

const TaskEvent = AmpersandState.extend({
  props: {
    task_id: 'string',
    task: 'object',
    events: ['array',false,() => { return [] }]
  }
})
const TaskEvents = AmpersandCollection.extend({ model: TaskEvent })

// representation of the current host group being display
module.exports = AmpersandState.extend({
  collections: {
    configTasks: Tasks,
    configResources: Resources,
    configTriggers: TaskEvents
  },
  fetchConfig (id,next) {
    const self = this

    XHR.send({
      method: 'get',
      url: `${config.api_url}/host/${id}/config`,
      withCredentials: true,
      done (data,xhr) {
        self.configTasks.reset(data.tasks)
        self.configResources.reset(data.resources)
        self.configTriggers.reset(data.triggers)
        next(null,data)
      },
      fail (err,xhr) {
        next(err)
      }
    })
  }
})
