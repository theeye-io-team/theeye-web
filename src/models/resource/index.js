import App from 'ampersand-app'
import State from 'ampersand-state'
import moment from 'moment'

import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import * as MonitorConstants from 'constants/monitor'

import stateIcon from 'models/state-icon'
import stateOrder from 'models/state-order'
import stateMeaning from 'models/state-meaning'

import config from 'config'
const urlRoot = `${config.supervisor_api_url}/monitor`
const nestedUrlRoot = `${config.supervisor_api_url}/monitor/nested`

function ResourceFactory (data, options={}) {
  let resource
  if (data.type == MonitorConstants.TYPE_NESTED) {
    resource = new NestedResource(data, options)
  } else {
    resource = new Resource(data, options)
  }
  resource.monitor = App.Models.Monitor.Factory(data.monitor||data, options)
  return resource
}

const _Collection = AppCollection.extend({
  model: ResourceFactory,
  isModel (model) {
    return model instanceof Resource || model instanceof NestedResource
  }
})

const ResourceCollection = _Collection.extend({
  url: urlRoot,
  // javascript array comparator
  comparator (m1,m2) {
    // sort by state order
    if (m1.stateOrder>m2.stateOrder) {
      return -1
    } else if (m1.stateOrder<m2.stateOrder) {
      return 1
    } else {
      // if equal state order, sort by name
      let name1 = m1.name ? m1.name.toLowerCase() : 0
      let name2 = m2.name ? m2.name.toLowerCase() : 0
      if (name1>name2) return -1
      else if (name1<name2) return 1
      else return 0
    }
  },
  higherSeverityMonitor () {
    const submonitors = this.models
    if (!submonitors||submonitors.length===0) {
      return null
    }
    return submonitors.reduce( (worstMonitor,monitor) => {
      if (!worstMonitor) { return monitor }
      let m1 = monitor.stateOrder
      let m2 = worstMonitor.stateOrder
      return (m1>m2) ? monitor : worstMonitor
    }, null )
  }
})

const ResourceSchema = AppModel.extend({
  props: {
    id: 'string',
    user_id: 'string', // owner/creator
    customer_id: 'string',
    customer_name: 'string',
    description: 'string',
    name: 'string',
    type: 'string',
    _type: 'string',
    acl: 'array',
    failure_severity: 'string',
    alerts: 'boolean',
    tags: ['array',false, () => { return [] }],
    source_model_id: 'string', // temporal , is used to create templates
    hostgroup_id: ['string', false, null] // only if belongs to
  },
  children: {
    customer: function (attrs, options) { // has one
      return new App.Models.Customer.Model(attrs, options)
    },
    user: function (attrs, options) { // has one
      return new App.Models.User.Model(attrs, options)
    }
  },
  derived: {
    summary: {
      deps: ['hostname','name'],
      fn () {
        return `[${this.hostname}] ${this.type} monitor ${this.name}`
      }
    }
  }
})

const ResourceBaseModel = ResourceSchema.extend({
  initialize (options) {
    //this.id = options._id || options.id
    ResourceSchema.prototype.initialize.apply(this,arguments)

    //this.tagsCollection = new App.Models.Tag.Collection([])

    this.listenToAndRun(this, 'change:tags', () => {
      if (Array.isArray(this.tags)) {
        let tags = this.tags.map((tag, index) => {
          return {_id: (index + 1).toString(), name: tag}
        })
        tags = tags.slice(0, 3)
        this.tagsCollection.set(tags)
      }
    })
  },
  collections: {
    tagsCollection: function (attrs, options) {
      return new App.Models.Tag.Collection(attrs, options)
    }
  },
  //session: {
  //  tagsCollection: 'collection'
  //},
  props: {
    monitor_id: 'string',
    hostname: 'string',
    fails_count: 'number',
    state: 'string',
    enable: 'boolean',
    creation_date: 'date',
    last_update: 'date',
    last_event: 'object',
    last_check: 'date'
  },
  derived: {
    last_update_formatted: {
      deps: ['last_update'],
      fn () {
        return moment(this.last_update)
          .startOf('second')
          .fromNow()
      }
    },
    /**
     * Based on resource state and its failure severity returns its severity state
     * If the resource is failing, resturns the failure severity instead.
     * @return String
     */
    stateSeverity: {
      deps: ['state','failure_severity'],
      fn () {
        const state = this.state || 'error'
        const severity = this.failure_severity || 'HIGH'

        if (state==='failure') {
          return severity.toLowerCase();
        } else {
          return state.toLowerCase();
        }
      }
    },
    formatted_tags: {
      deps: ['name','hostname','type','state','failure_severity','tags','acl'],
      fn () {
        return [
          this.name,
          this.state,
          this.hostname,
          this.type,
          this.failure_severity
        ].concat(this.acl, this.tags)
      }
    },
    stateIcon: {
      deps: ['stateSeverity'],
      fn () {
        return stateIcon[ this.stateSeverity ]
      }
    },
    stateOrder: {
      deps: ['stateSeverity'],
      fn () {
        return stateOrder.orderOf( this.stateSeverity )
      }
    }
  },
  hasError () {
    return this.state === 'failure' || this.state === 'updates_stopped'
  },
  parse (attrs) {
    const monitor = (attrs.monitor || attrs.template_monitor)
    if (!monitor) { return attrs }
    return Object.assign({}, attrs, {
      // monitor
      looptime: monitor.looptime,
      tags: monitor.tags
    })
  },
  serialize () {
    const serialize = ResourceSchema.prototype.serialize
    const monitor = this.monitor.serialize()
    let data = Object.assign({}, serialize.apply(this), monitor)

    data.id = this.id

    delete data.customer
    delete data.user
    delete data.host

    return data
  }
})

const Resource = ResourceBaseModel.extend({
  urlRoot,
  props: {
    template_id: 'string',
    host_id: 'string',
  },
  children: {
    template: ResourceSchema, // belongs to
    monitor: function (attrs, options) { // has one
      return new App.Models.Monitor.Factory(attrs, options)
    },
    host: function (attrs, options) { // belongs to
      return new App.Models.Host.Model(attrs, options)
    }
  },
})

const NestedResource = ResourceBaseModel.extend({
  urlRoot: nestedUrlRoot,
  children: {
    monitor: function (attrs, options) { // has one
      return new App.Models.Monitor.Factory(attrs, options)
    },
  },
  initialize () {
    ResourceBaseModel.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_NESTED
  }
})

/**
 * Resource but with a subresources/submonitors collection
 */
const GroupedResource = Resource.extend({
  hasError () {
    if (!this.submonitors || this.submonitors.length===0) {
      return false
    }

    return this.submonitors
      .filter(m => m.hasError())
      .length > 0
  },
  collections: {
    submonitors: ResourceCollection
  },
  initialize () {
    Resource.prototype.initialize.apply(this,arguments)

    this.listenTo(this.submonitors,'change add reset',() => {
      if (this.submonitors.length===0) return
      const monitor = this.submonitors.higherSeverityMonitor()

      this.state = monitor.state
      this.failure_severity = monitor.failure_severity
    })
  }
})

const GroupedResourceCollection = ResourceCollection.extend({
  // is not being used. this collection works like a subset of the resources collection
  //model (attrs, options) {
  //},
  isModel (model) {
    const isModel = ResourceCollection.prototype.isModel

    return isModel.call(this, model) || model instanceof GroupedResource
  },
  find (resource) {
    const _find = ResourceCollection.prototype.find
    // find the resource within a group or theresource alone
    return _find.call(this, group => {
      if (group.id === resource.id) return true
      if (!group.submonitors||group.submonitors.length===0) return false

      const item = group.submonitors.find(m => {
        if (m.id === resource.id) return true
        else if (m.type === 'host') {
          if (!m.submonitors||m.submonitors.length===0) return false
          return m.submonitors.get(resource.id)
        }
      })
      return item !== undefined
    })
  }
})

export const Model = Resource
export const Nested = NestedResource
export const Factory = ResourceFactory
export const Collection = ResourceCollection
export { GroupedResourceCollection, GroupedResource }
