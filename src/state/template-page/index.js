'use strict'

import AmpersandState from 'ampersand-state'
import TaskEvents from './task-event'
//import gconfig from 'config'

const Resources = require('models/resource').Collection
const Tasks = require('models/task').Collection
import { Model as File, Collection as Files } from 'models/file'

// representation of a host template
module.exports = AmpersandState.extend({
  //session: {
  //  notConfigured: 'boolean'
  //},
  notConfigured () {
    const noConfig = (
      this.resources.length === 0 &&
      this.tasks.length === 0 &&
      this.triggers.length === 0 &&
      this.files.length === 0
    )
    return noConfig
  },
  collections: {
    files: Files,
    tasks: Tasks,
    resources: Resources,
    triggers: TaskEvents
  },
  setTemplate (template) {
    this.files.reset(template.files.models)
    this.tasks.reset(template.tasks.models)
    this.resources.reset(template.resources.models)
    this.triggers.reset(template.triggers.models)
  },
  setConfigs (config) {
    this.files.reset(config.files || [], { parse: true })
    this.tasks.reset(config.tasks || [], { parse: true })
    this.resources.reset(config.resources || [], { parse: true })
    this.triggers.reset(config.triggers || [], { parse: true })
  },
  resetCollection () {
    this.files.reset([])
    this.tasks.reset([])
    this.resources.reset([])
    this.triggers.reset([])
  }
})
