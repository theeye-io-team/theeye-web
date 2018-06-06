'use strict'

import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
import XHR from 'lib/xhr'
//import gconfig from 'config'

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
export default AmpersandState.extend({
  collections: {
    configTasks: Tasks,
    configResources: Resources,
    configTriggers: TaskEvents
  },
  setConfigs (config) {
    this.configTasks.reset(config.tasks,{ parse: true })
    this.configResources.reset(config.resources,{ parse: true })
    this.configTriggers.reset(config.triggers,{ parse: true })
  },
  resetCollection () {
    this.configTasks.reset([])
    this.configResources.reset([])
    this.configTriggers.reset([])
  }
})
