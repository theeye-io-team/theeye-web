'use strict'

import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import Collection from 'ampersand-collection'
const config = require('config')
import EventConstants from 'constants/event'
import EmitterConstants from 'constants/emitter'
import MONITOR from 'constants/monitor'

class EmitterFactory {
  constructor (attrs, options) {
    var EmitterClass
    const type = attrs._type

    if (!type) {
      throw new Error(`Cannot build an Emitter without a type`)
    }

    switch (type) {
      case EmitterConstants.TASK_SCRIPT:
        EmitterClass = App.Models.Task.Script
        break
      case EmitterConstants.TASK_SCRAPER:
        EmitterClass = App.Models.Task.Scraper
        break
      case EmitterConstants.TASK_APPROVAL:
        EmitterClass = App.Models.Task.Approval
        break
      case EmitterConstants.TASK_DUMMY:
        EmitterClass = App.Models.Task.Dummy
        break
      //case 'ResourceMonitor': // monitors with config subdocument
      case EmitterConstants.RESOURCE:
        EmitterClass = App.Models.Resource.Model
        break
      case EmitterConstants.WEBHOOK:
        EmitterClass = App.Models.Webhook.Model
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
        let emitter = this.emitter
        if (!emitter) { return 'Event definition error' }

        let eventName = this.name
        let emitterType = emitter._type
        let summary
        let hostname

        if (emitter.host) {
          hostname = emitter.host.hostname.toLowerCase()
        }

        switch (emitterType) {
          case EmitterConstants.WEBHOOK:
            summary = `Incomming Webhook ${emitter.name} trigger`
            break;
          case EmitterConstants.MONITOR:
            summary = monitorEventSummary(emitter, eventName)
            break;
          case EmitterConstants.TASK_SCRIPT:
            if (eventName === EventConstants.SUCCESS) {
              summary = `Task Script, ${emitter.name}, ${hostname} success`
            } else if (eventName === EventConstants.FAILURE) {
              summary = `Task Script, ${emitter.name}, ${hostname} failure`
            }
            break
          case EmitterConstants.TASK_SCRAPER:
            if (eventName === EventConstants.SUCCESS) {
              summary = `Task Webcheck, ${emitter.name}, ${hostname} success`
            } else if (eventName === EventConstants.FAILURE) {
              summary = `Task Webcheck, ${emitter.name}, ${hostname} failure`
            }
            break;
          case EmitterConstants.TASK_APPROVAL:
            if (eventName === EventConstants.SUCCESS) {
              summary = `Task Approval, ${emitter.name} approved`
            } else if (eventName === EventConstants.FAILURE) {
              summary = `Task Approval, ${emitter.name} rejected`
            }
            break;
          case EmitterConstants.TASK_DUMMY:
            if (eventName === EventConstants.SUCCESS) {
              summary = `Task Inputs, ${emitter.name} success`
            } else if (eventName === EventConstants.FAILURE) {
              summary = `Task Inputs, ${emitter.name} failure`
            }
            break;
        }

        return summary
      }
    },
    displayable: {
      deps: ['emitter','name'],
      fn () {
        let emitter = this.emitter
        if (!emitter) { return false }

        let eventName = this.name
        let emitterType = emitter._type
        let displayable = true

        switch (emitterType) {
          case EmitterConstants.MONITOR:
            displayable = isDisplayableMonitorEmitter(emitter, eventName)
            break
          case EmitterConstants.TASK_SCRIPT:
          case EmitterConstants.TASK_SCRAPER:
          case EmitterConstants.TASK_DUMMY:
            displayable = Boolean(eventName === EventConstants.SUCCESS)
            break
          case EmitterConstants.TASK_APPROVAL:
          case EmitterConstants.WEBHOOK:
          default:
            displayable = true
            break
        }

        return displayable
      }
    }
  }
})

const monitorEventSummary = (emitter, eventName) => {
  let summary, hostname
  let typeStr = displayMonitorType(emitter)
  if (emitter.host) {
    hostname = emitter.host.hostname.toLowerCase()
  }

  if (eventName === EventConstants.RECOVERED) {
    if (emitter.type === MONITOR.TYPE_FILE) {
      summary = `Monitor ${typeStr}, ${emitter.name}, ${hostname} created`
    } else {
      summary = `Monitor ${typeStr}, ${emitter.name}, ${hostname} recovered`
    }
  }
  else if (eventName === EventConstants.FAILURE) {
    summary = `Monitor ${typeStr}, ${emitter.name}, ${hostname} failure`
  }
  else if (eventName === EventConstants.UPDATES_STOPPED) {
    summary = `Monitor ${typeStr}, ${emitter.name}, ${hostname} updates stopped`
  }
  else if (eventName === EventConstants.UPDATES_STARTED) {
    summary = `Monitor ${typeStr}, ${emitter.name}, ${hostname} updates started`
  }
  else if (eventName === EventConstants.CHANGED) {
    summary = `Monitor ${typeStr}, ${emitter.name}, ${hostname} changed`
  }
  return summary
}

const displayMonitorType = (emitter) => {
  const type = emitter.type
  if (type===MONITOR.TYPE_FILE) return 'file'
  if (type===MONITOR.TYPE_PROCESS) return 'process'
  if (type===MONITOR.TYPE_SCRAPER) return 'webcheck'
  if (type===MONITOR.TYPE_HOST) return 'host'
  if (type===MONITOR.TYPE_SCRIPT) return 'script'
  if (type===MONITOR.TYPE_DSTAT) return 'health'
  if (type===MONITOR.TYPE_PSAUX) return 'processes'
}

const isDisplayableMonitorEmitter = (emitter, eventName) => {
  let subtype = emitter.type // only monitors has subtype for now
  // ignore "updates_stopped"
  if (subtype === MONITOR.TYPE_FILE) {
    return Boolean(
      eventName === EventConstants.RECOVERED ||
      eventName === EventConstants.CHANGED
    )
  } else if (subtype === MONITOR.TYPE_HOST) {
    return Boolean(
      //eventName === EventConstants.RECOVERED ||
      eventName === EventConstants.UPDATES_STOPPED ||
      eventName === EventConstants.UPDATES_STARTED
    )
  } else if (
    subtype === MONITOR.TYPE_DSTAT ||
    subtype === MONITOR.TYPE_PSAUX
  ) {
    return false
  } else {
    return Boolean(
      eventName === EventConstants.RECOVERED ||
      eventName === EventConstants.FAILURE
    )
  }
}

const EmitterCollection = Collection.extend({
  model: EmitterFactory,
  isModel: function (model) {
    const isModel =
      model instanceof App.Models.Task.Dummy ||
      model instanceof App.Models.Task.Approval ||
      model instanceof App.Models.Task.Script ||
      model instanceof App.Models.Task.Scraper ||
      model instanceof App.Models.Resource.Model ||
      model instanceof App.Models.Webhook.Model
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
