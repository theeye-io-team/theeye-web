'use strict'

import { Script as ScriptTask } from 'models/task'
import { Scraper as ScraperTask } from 'models/task'
import { Model as Monitor } from 'models/monitor'
import { Model as Webhook } from 'models/webhook'

class Factory {
  constructor (props) {
    var EmitterClass
    const type = props._type

    if (!type) {
      throw new Error(`Cannot build an Emitter without a type`)
    }

    switch (type) {
      case 'Task':  // script task
        EmitterClass = ScriptTask
        break
      case 'ScraperTask': // scraper task
        EmitterClass = ScraperTask
        break
      case 'ResourceMonitor': // monitors with config subdocument
        EmitterClass = Monitor
        break
      case 'Webhook': // Incomming Webhook
        EmitterClass = Webhook
        break
    }

    if (!EmitterClass) {
      throw new Error(`Cannot build an Emitter for type ${type}`)
    }

    return new EmitterClass(props)
  }
}

module.exports = Factory
