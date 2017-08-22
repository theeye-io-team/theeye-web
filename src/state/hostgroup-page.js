'use strict'

import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
import { Collection as Resources } from 'models/resource'
import { Collection as Tasks } from 'models/task'
import XHR from 'lib/xhr'

const TaskEvent = AmpersandState.extend({
  props: {
    task_id: 'string',
    task: 'object',
    events: ['array',false,() => { return [] }]
  }
})
const TaskEvents = AmpersandCollection.extend({ model: TaskEvent })

// representation of the current host group being display
export default AmpersandState.extend({
  //props: {
  //  currentGroup: 'state'
  //},
  collections: {
    configTasks: Tasks,
    configResources: Resources,
    configTriggers: TaskEvents
  },
  fetchConfig (id,next) {
    const self = this

    XHR({
      method: 'get',
      url: `/api/host/${id}/config`,
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
