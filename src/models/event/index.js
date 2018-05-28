'use strict'

import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import Collection from 'ampersand-collection'
const config = require('config')
import EventConstants from 'constants/event'
import EMITTER from 'constants/emitter'
import MONITOR from 'constants/monitor'

const displayType = (emitter) => {
  const type = emitter.type
  if (type===MONITOR.TYPE_FILE) return 'file'
  if (type===MONITOR.TYPE_PROCESS) return 'process'
  if (type===MONITOR.TYPE_SCRAPER) return 'webcheck'
  if (type===MONITOR.TYPE_HOST) return 'host'
  if (type===MONITOR.TYPE_SCRIPT) return 'script'
  if (type===MONITOR.TYPE_DSTAT) return 'health'
  if (type===MONITOR.TYPE_PSAUX) return 'processes'
}

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
      //case 'ResourceMonitor': // monitors with config subdocument
      case 'Resource': // monitors with config subdocument
        EmitterClass = App.Models.Resource
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
        let hostname
        if (this.emitter.host) {
          hostname = this.emitter.host.hostname.toLowerCase()
        }

        switch (emitterType) {
          case EMITTER.WEBHOOK:
            summary = `Incomming Webhook ${this.emitter.name} trigger`
            break;

          case EMITTER.MONITOR:
            let typeStr = displayType(this.emitter)
            if (eventName === EventConstants.RECOVERED) {
              if (this.emitter.type===MONITOR.TYPE_FILE) {
                summary = `Monitor ${typeStr}, ${this.emitter.name}, ${hostname} created`
              } else {
                summary = `Monitor ${typeStr}, ${this.emitter.name}, ${hostname} recovered`
              }
            }
            else if (eventName === EventConstants.FAILURE) {
              summary = `Monitor ${typeStr}, ${this.emitter.name}, ${hostname} failure`
            }
            else if (eventName === EventConstants.UPDATES_STOPPED) {
              summary = `Monitor ${typeStr}, ${this.emitter.name}, ${hostname} updates stopped`
            }
            else if (eventName === EventConstants.UPDATES_STARTED) {
              summary = `Monitor ${typeStr}, ${this.emitter.name}, ${hostname} updates started`
            }
            else if (eventName === EventConstants.CHANGED) {
              summary = `Monitor ${typeStr}, ${this.emitter.name}, ${hostname} changed`
            }
            break;

          case EMITTER.TASK_SCRIPT:
            if (eventName === EventConstants.SUCCESS) {
              summary = `Task script, ${this.emitter.name}, ${hostname} success`
            }
            if (eventName === EventConstants.FAILURE) {
              summary = `Task script, ${this.emitter.name}, ${hostname} failure`
            }
            break

          case EMITTER.TASK_SCRAPER:
            if (eventName === EventConstants.SUCCESS) {
              summary = `Task webcheck, ${this.emitter.name}, ${hostname} success`
            }
            if (eventName === EventConstants.FAILURE) {
              summary = `Task webcheck, ${this.emitter.name}, ${hostname} failure`
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
            return Boolean(
              eventName === EventConstants.RECOVERED ||
              eventName === EventConstants.CHANGED
            )
          }
          else if (subtype === MONITOR.TYPE_HOST) {
            return Boolean(
              //eventName === EventConstants.RECOVERED ||
              eventName === EventConstants.UPDATES_STOPPED ||
              eventName === EventConstants.UPDATES_STARTED
            )
          }
          else if (
            subtype === MONITOR.TYPE_DSTAT ||
            subtype === MONITOR.TYPE_PSAUX
          ) {
            return false
          }
          else {
            return Boolean(eventName === EventConstants.RECOVERED || eventName === EventConstants.FAILURE)
          }
        }
        else if (emitterType === EMITTER.TASK_SCRIPT || emitterType === EMITTER.TASK_SCRAPER) {
          return Boolean(eventName === EventConstants.SUCCESS)
        }
      }
    }
  }
  //children: {
  //  emitter: EmitterFactory
  //}
})

const EmitterCollection = Collection.extend({
  model: EmitterFactory,
  isModel: function (model) {
    const isModel =
      model instanceof App.Models.Task.Script ||
      model instanceof App.Models.Task.Scraper ||
      model instanceof App.Models.Resource ||
      model instanceof App.Models.Webhook
    return isModel
  }
})

const EventsCollection = AppCollection.extend({
  url: urlRoot,
  model: Model,
  /**
   * @param {Emitter} emitter
   * @param {AmpersandCollection} excludes
   */
  filterEmitterEvents (emitter, excludes) {
    let type = emitter._type
    let events

    if (type === 'Resource') {
      events = this.filter((ev) => {
        var keep = (
          ev.emitter_id == emitter.monitor.id &&
          excludes.get(ev.id) === undefined
        )
        return keep
      })
    } else {
      events = this.filter((ev) => {
        var keep = (
          ev.emitter_id == emitter.id &&
          excludes.get(ev.id) === undefined
        )
        return keep
      })
    }
    return events
  }
})

exports.EmitterCollection = EmitterCollection
exports.Collection = EventsCollection
exports.Model = Model
exports.EmitterFactory = EmitterFactory
