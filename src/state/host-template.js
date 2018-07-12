'use strict'

import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'
//import gconfig from 'config'

const Resources = require('models/resource').Collection
const Tasks = require('models/task').Collection
import { Model as File, Collection as Files } from 'models/file'

const TaskEvent = AmpersandState.extend({
  props: {
    task_id: 'string',
    task: 'object',
    events: ['array',false,() => { return [] }]
  }
})

const TaskEvents = AmpersandCollection.extend({ model: TaskEvent })

// representation of a host template
export default AmpersandState.extend({
  collections: {
    configFiles: Files,
    configTasks: Tasks,
    configResources: Resources,
    configTriggers: TaskEvents
  },
  setConfigs (config) {
    this.configFiles.reset(config.files || [], { parse: true })
    this.configTasks.reset(config.tasks || [], { parse: true })
    this.configResources.reset(config.resources || [], { parse: true })
    this.configTriggers.reset(config.triggers || [], { parse: true })
  },
  resetCollection () {
    this.configFiles.reset([])
    this.configTasks.reset([])
    this.configResources.reset([])
    this.configTriggers.reset([])
  }
})
