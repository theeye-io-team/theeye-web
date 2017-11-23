'use strict'

import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
const config = require('config')
import EVENT from 'constants/event'
import EMITTER from 'constants/emitter'
import MONITOR from 'constants/monitor'

const displayType = (emitter) => {
  const type = emitter.type
  if (type===MONITOR.TYPE_FILE) return 'File'
  if (type===MONITOR.TYPE_PROCESS) return 'Process'
  if (type===MONITOR.TYPE_SCRAPER) return 'WebCheck'
  if (type===MONITOR.TYPE_HOST) return 'Host'
  if (type===MONITOR.TYPE_SCRIPT) return 'Script'
  if (type===MONITOR.TYPE_DSTAT) return 'Health'
  if (type===MONITOR.TYPE_PSAUX) return 'Processes'
}

//import { Script as ScriptTask } from 'models/task'
//import { Scraper as ScraperTask } from 'models/task'
//import { Model as Monitor } from 'models/monitor'
//import { Model as Webhook } from 'models/webhook'

class EmitterFactory {
  constructor (attrs, options) {
    var EmitterClass
    const type = attrs._type

    if (!type) {
      throw new Error(`Cannot build an Emitter without a type`)
    }

    switch (type) {
      case 'Task':  // script task
        EmitterClass = App.Models.Task.Script
        break
      case 'ScraperTask': // scraper task
        EmitterClass = App.Models.Task.Scraper
        break
      case 'ResourceMonitor': // monitors with config subdocument
        EmitterClass = App.Models.Monitor
        break
      case 'Webhook': // Incomming Webhook
        EmitterClass = App.Models.Webhook
        break
    }

    if (!EmitterClass) {
      throw new Error(`Cannot build an Emitter for type ${type}`)
    }

    return new EmitterClass (attrs, options)
  }
}

const urlRoot = `${config.api_url}/event`
const Model = AppModel.extend({
  urlRoot: urlRoot,
  props: {
    id: 'string',
    emitter_id: 'string',
    emitter: 'object',
		name: 'string',
    creation_date: 'date',
    last_update: 'date',
    enable: 'boolean',
    secret: 'string',
    customer_id: 'string',
    _type: 'string' // schema internal type
  },
  derived: {
    emitter_type: {
      deps: ['emitter'],
      fn () {
        return this.emitter._type
      }
    },
    summary: {
      deps: ['emitter'],
      fn () {
        if (!this.emitter) return 'Event definition error'

        let eventName = this.name
        let emitterType = this.emitter._type
        let summary

        switch (emitterType) {
          case EMITTER.WEBHOOK:
            summary = `Incomming Webhook ${this.emitter.name} trigger`
            break;
          case EMITTER.MONITOR:
            let typeStr = displayType(this.emitter)
            if (eventName === EVENT.RECOVERED) {
              if (this.emitter.type===MONITOR.TYPE_FILE) {
                summary = `${typeStr} monitor ${this.emitter.name} created`
              } else {
                summary = `${typeStr} monitor ${this.emitter.name} recovered`
              }
            }
            else if (eventName === EVENT.FAILURE) {
              summary = `${typeStr} monitor ${this.emitter.name} failure`
            }
            else if (eventName === EVENT.STOPPED) {
              summary = `${typeStr} monitor ${this.emitter.name} stopped`
            }
            else if (eventName === EVENT.CHANGED) {
              summary = `${typeStr} monitor ${this.emitter.name} changed`
            }
            break;
          case EMITTER.TASK_SCRIPT:
            if (eventName === EVENT.SUCCESS) {
              summary = `Script task ${this.emitter.name} success`
            }
            if (eventName === EVENT.FAILURE) {
              summary = `Script task ${this.emitter.name} failure`
            }
            break
          case EMITTER.TASK_SCRAPER:
            if (eventName === EVENT.SUCCESS) {
              summary = `WebCheck task ${this.emitter.name} success`
            }
            if (eventName === EVENT.FAILURE) {
              summary = `WebCheck task ${this.emitter.name} failure`
            }
            break;
        }

        return summary
      }
    },
    displayable: {
      deps: ['emitter','name'],
      fn () {
        if (!this.emitter) return false

        let eventName = this.name
        let emitterType = this.emitter._type
        if (emitterType === EMITTER.WEBHOOK) {
          return true
        }
        else if (emitterType === EMITTER.MONITOR) {
          let subtype = this.emitter.type // only monitors has subtype for now
          // ignore "updates_stopped"
          if (subtype === MONITOR.TYPE_FILE) {
            return Boolean(eventName === EVENT.RECOVERED || eventName === EVENT.CHANGED)
          }
          else if (subtype === MONITOR.TYPE_HOST) {
            return Boolean(eventName === EVENT.RECOVERED || eventName === EVENT.STOPPED)
          }
          else if (subtype === MONITOR.TYPE_DSTAT || subtype === MONITOR.TYPE_PSAUX) {
            return false
          }
          else {
            return Boolean(eventName === EVENT.RECOVERED || eventName === EVENT.FAILURE)
          }
        }
        else if (emitterType === EMITTER.TASK_SCRIPT || emitterType === EMITTER.TASK_SCRAPER) {
          return Boolean(eventName === EVENT.SUCCESS)
        }
      }
    }
  }
  //children: {
  //  emitter: EmitterFactory
  //}
})

const Collection = AppCollection.extend({
  url: urlRoot,
  model: Model
})

exports.Collection = Collection
exports.Model = Model
exports.EmitterFactory = EmitterFactory
