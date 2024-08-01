import App from 'ampersand-app'
import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import Collection from 'ampersand-collection'
import config from 'config'
import * as EventConstants from 'constants/event'
import * as EmitterConstants from 'constants/emitter'
import * as MonitorConstants from 'constants/monitor'

const urlRoot = function () {
  return `${config.supervisor_api_url}/${App.state.session.customer.name}/event`
}

const Model = AppModel.extend({
  urlRoot,
  props: {
    id: 'string',
    emitter: 'object',
    emitter_id: 'string',
    emitter_prop: 'string',
    emitter_value: 'string',
		name: 'string',
    creation_date: 'date',
    last_update: 'date',
    enable: 'boolean',
    secret: 'string',
    customer_id: 'string',
    _type: 'string' // schema internal type
  },
  derived: {
    summary: {
      deps: ['emitter', 'emitter_prop', 'emitter_value'],
      fn () {
        if (this.emitter_prop && this.emitter_value) {
          return `${this.name} ${this._type} if "${this.emitter_prop}" is "${this.emitter_value}"`
        } else if (this.emitter) {
          const emitter = this.emitter
          const eventName = this.name
          const emitterType = emitter._type

          let summary = ''
          if (EmitterConstants.WEBHOOK === emitterType) {
            summary = `Incoming Webhook ${emitter.name} trigger`
          } else if (EmitterConstants.MONITOR === emitterType) {
            summary = monitorEventSummary(emitter, eventName)
          } else if (/Task/.test(emitterType) === true) {
            summary = taskEventSummary(emitter, eventName)
          } else if (/Indicator/.test(emitterType) === true) {
            summary = `${emitterType} ${emitter.title} > ${eventName}`
          } else {
            summary = `${emitterType} ${emitter.name || emitter.title} > ${eventName}`
          }
          return summary
        } else {
          return 'summary not available'
        }
      }
    },
    displayable: {
      deps: ['emitter', 'name', 'emitter_prop', 'emitter_value'],
      fn () {
        // custom events
        if (this.emitter_prop && this.emitter_value) {
          return true
        } else if (this.emitter) {
          let displayable = true
          switch (this.emitter._type) {
            case EmitterConstants.MONITOR:
              displayable = isDisplayableMonitorEmitter(this.emitter, this.name)
              break
            case EmitterConstants.TASK_SCRIPT:
            case EmitterConstants.TASK_SCRAPER:
            case EmitterConstants.TASK_DUMMY:
              displayable = true
              break
            case EmitterConstants.TASK_APPROVAL:
            case EmitterConstants.WEBHOOK:
            default:
              displayable = true
              break
          }
          return displayable
        } else {
          return false
        }
      }
    }
  }
})

const taskEventSummary = (emitter, eventName) => {
  let hostname, summary

  if (
    emitter.host &&
    typeof emitter.host === 'object' &&
    emitter.host.hasOwnProperty('hostname')
  ) {
    hostname = emitter.host.hostname.toLowerCase()
  }

  switch (emitter._type) {
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

  if (emitter.workflow_id) { summary += ' (task belongs to workflow)' }

  return summary
}

const monitorEventSummary = (emitter, eventName) => {
  let summary, hostname
  let typeStr = displayMonitorType(emitter)

  if (
    emitter.host &&
    typeof emitter.host === 'object' &&
    emitter.host.hasOwnProperty('hostname')
  ) {
    hostname = emitter.host.hostname.toLowerCase()
  }

  if (eventName === EventConstants.RECOVERED) {
    if (emitter.type === MonitorConstants.TYPE_FILE) {
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
  if (type===MonitorConstants.TYPE_FILE) return 'file'
  if (type===MonitorConstants.TYPE_PROCESS) return 'process'
  if (type===MonitorConstants.TYPE_SCRAPER) return 'webcheck'
  if (type===MonitorConstants.TYPE_HOST) return 'host'
  if (type===MonitorConstants.TYPE_SCRIPT) return 'script'
  if (type===MonitorConstants.TYPE_DSTAT) return 'health'
  if (type===MonitorConstants.TYPE_PSAUX) return 'processes'
}

const isDisplayableMonitorEmitter = (emitter, eventName) => {
  let subtype = emitter.type // only monitors has subtype for now
  // ignore "updates_stopped"
  if (subtype === MonitorConstants.TYPE_FILE) {
    return Boolean(
      eventName === EventConstants.RECOVERED ||
      eventName === EventConstants.CHANGED
    )
  } else if (subtype === MonitorConstants.TYPE_HOST) {
    return Boolean(
      //eventName === EventConstants.RECOVERED ||
      eventName === EventConstants.UPDATES_STOPPED ||
      eventName === EventConstants.UPDATES_STARTED
    )
  } else if (subtype === MonitorConstants.TYPE_DSTAT) {
    return Boolean(
      eventName === EventConstants.RECOVERED ||
      eventName === EventConstants.FAILURE
    )
  } else if (subtype === MonitorConstants.TYPE_PSAUX) {
    return false
  } else {
    return Boolean(
      eventName === EventConstants.RECOVERED ||
      eventName === EventConstants.FAILURE
    )
  }
}

//class EmitterFactory {
//  constructor (attrs, options) {
//    let EmitterClass
//    const type = attrs._type
//
//    if (!type) {
//      throw new Error(`Cannot build an Emitter without a type`)
//    }
//
//    if (/Task/.test(type) === true) {
//      EmitterClass = App.Models.Task.Factory
//    } else if (EmitterConstants.RESOURCE === type) {
//      EmitterClass = App.Models.Resource.Model
//    } else if (EmitterConstants.WEBHOOK === type) {
//      EmitterClass = App.Models.Webhook.Model
//    }
//
//    if (!EmitterClass) {
//      throw new Error(`Cannot build an Emitter for type ${type}`)
//    }
//
//    return new EmitterClass (attrs, options)
//  }
//}

//const EmitterCollection = Collection.extend({
//  model: EmitterFactory,
//  isModel: function (model) {
//    return true
//  }
//  isModel: function (model) {
//    const isModel =
//      model instanceof App.Models.Task.Dummy ||
//      model instanceof App.Models.Task.Approval ||
//      model instanceof App.Models.Task.Script ||
//      model instanceof App.Models.Task.Scraper ||
//      model instanceof App.Models.Resource.Model ||
//      model instanceof App.Models.Webhook.Model
//    return isModel
//  }
//})

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

export {
  //EmitterFactory,
  //EmitterCollection,
  Model,
  EventsCollection as Collection
}
