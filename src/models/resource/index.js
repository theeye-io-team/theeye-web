import AppCollection from 'lib/app-collection'
import moment from 'moment'
import assign from 'lodash/assign'
import MonitorConstants from 'constants/monitor'

const MonitorSchema = require('./monitor-schema')
const ResourceSchema = require('./resource-schema')
const MonitorTemplate = require('./monitor-template')
const ResourceTemplate = require('./resource-template')
const Host = require('models/host/index').Model

const config = require('config')
const urlRoot = `${config.api_url}/resource`
const stateIcons = {
  low: 'icon-severity-low',
  high: 'icon-severity-high',
  critical: 'icon-severity-critical',
  /*
   * failure states
   */
  unknown: 'icon-state-nonsense',
  normal: 'icon-state-normal',
  failure: 'icon-state-failure', // failing
  updates_stopped: 'icon-state-updates_stopped', // not reporting
  getIcon (state) {
    var icon = (this[state.toLowerCase()]||this.unknown);
    return icon;
  },
  orderOf (value) {
    //
    // WARNING: KEEP THE INDEXES IN ORDER !!
    //
    return [
      'unknown',
      'normal',
      'low',
      'high',
      'critical',
      // when failure_severity is not defined use the state
      'failure',
      'updates_stopped'
    ].indexOf(value)
  },
  //classToState (iconClass) {
  //  var self = this;
  //  var elems = Object.keys(self).filter(function(state){
  //    if (self[state]==iconClass) return state
  //  })
  //  return elems[0]
  //},
  //filterAlertIconClasses (iconClasses) {
  //  var failureClasses = ['icon-info','icon-warn','icon-fatal'],
  //    filtered = iconClasses.filter(function(idx,icon){
  //      return failureClasses.indexOf(icon) != -1
  //    });
  //  return filtered;
  //}
}

const stateMessages = {
  normal: 'Working fine',
  failure: 'Attention required',
  updates_stopped: 'Stopped reporting',
}

/**
 *
 * monitor resource submodel
 *
 */
const MonitorBaseModel = MonitorSchema.extend({
  props: {
    resource_id: 'string',
    enable: 'boolean',
    creation_date: 'date',
    last_update: 'date'
  },
  children: {
    template: MonitorTemplate
  },
  serialize () {
    const serialize = MonitorSchema.prototype.serialize
    return Object.assign({}, serialize.apply(this), this.config)
  }
})

const Monitor = MonitorBaseModel.extend({
  props: {
    host_id: 'string',
    template_id: 'string',
  },
  children: {
    host: Host
  }
})

const NestedMonitor = MonitorBaseModel.extend({
  props: {
    looptime: ['number', false, 0] // is not required
  },
  initialize () {
    MonitorBaseModel.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_NESTED
  }
})


const ResourceBaseModel = ResourceSchema.extend({
  urlRoot: urlRoot,
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
      deps: ['name','hostname','type','state','failure_severity','tags'],
      fn () {
        return [
          'name=' + this.name,
          'state=' + this.state,
          'hostname=' + this.hostname,
          'type=' + this.type,
          'criticity=' + this.failure_severity
        ].concat(this.tags)
      }
    },
    stateIcon: {
      deps: ['stateSeverity'],
      fn () {
        return stateIcons[ this.stateSeverity ]
      }
    },
    stateOrder: {
      deps: ['stateSeverity'],
      fn () {
        return stateIcons.orderOf( this.stateSeverity )
      }
    },
    stateMessage: {
      deps: ['state'],
      fn () {
        return stateMessages[this.state] || 'Cannot determine'
      }
    }
  },
  hasError () {
    return this.state === 'failure' || this.state === 'updates_stopped'
  },
  parse (attrs) {
    const monitor = attrs.monitor
    if (!monitor) return attrs

    return assign({}, attrs, {
      // monitor
      looptime: monitor.looptime,
      tags: monitor.tags
    })
  },
  serialize () {
    const serialize = ResourceSchema.prototype.serialize

    const monitor = this.monitor.serialize()
    return assign({}, serialize.apply(this), monitor)
  }
})

const Resource = ResourceBaseModel.extend({
  props: {
    template_id: 'string',
    host_id: 'string',
  },
  children: {
    monitor: Monitor, // has one
    template: ResourceTemplate.Model, // belongs to
    host: Host, // belongs to
  },
})

const NestedResource = ResourceBaseModel.extend({
  urlRoot: `${config.api_v3_url}/resource/nested`,
  children: {
    monitor: NestedMonitor, // has one
  },
  initialize () {
    Resource.prototype.initialize.apply(this, arguments)
    this.type = MonitorConstants.TYPE_NESTED
  }
})

function MonitorFactory (data) {
  if (data.type == MonitorConstants.TYPE_NESTED) {
    return new NestedMonitor(data)
  } else {
    return new Monitor(data)
  }
}

function ResourceFactory (model, options={}) {
  let resource
  let monitor = MonitorFactory(data)

  if (model.type == MonitorConstants.TYPE_NESTED) {
    resource = new NestedResource(model, options)
  } else {
    resource = new Resource(model, options)
  }
  resource.monitor = monitor
  return resource
}

const Collection = AppCollection.extend({
  //model: Resource,
  model: ResourceFactory,
  isModel (model) {
    return model instanceof Resource || model instanceof NestedResource
  },
  url: urlRoot,
  /**
   * obtein a collection of every single tag.
   * @return {Collection}
   */
  tagsUnique () {
    var tags = this.reduce(function(tags,resource){
      resource.get('formatted_tags').forEach(function(tag){
        if (tags.indexOf(tag)==-1) {
          tags.push(tag);
        }
      });
      return tags;
    },[]);

    return new Collection(
      tags.map(function(t){
        return { name: t } ;
      })
    );
  },
  // javascript array comparator
  comparator (m1,m2) {
    // sort by state order
    if (m1.stateOrder>m2.stateOrder) {
      return -1
    } else if (m1.stateOrder<m2.stateOrder) {
      return 1
    } else {
      // if equal state order, sort by name
      let name1 = m1.name.toLowerCase()
      let name2 = m2.name.toLowerCase()
      if (name1<name2) return -1
      else if (name1>name2) return 1
      else return 0
    }
  },
  higherSeverityMonitor () {
    const submonitors = this.models
    if (!submonitors||submonitors.length===0) return null
    return submonitors.reduce( (worstMonitor,monitor) => {
      if (!worstMonitor) return monitor;
      var m1 = monitor.stateOrder
      var m2 = worstMonitor.stateOrder
      return (m1>m2) ? monitor : worstMonitor;
    }, null )
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
    submonitors: Collection
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

const GroupedResourceCollection = Collection.extend({
  // is not being used. this collection works like a subset of the resources collection
  //model (attrs, options) {
  //},
  isModel (model) {
    const isModel = Collection.prototype.isModel

    return isModel.call(this, model) || model instanceof GroupedResource
  },
  find (resource) {
    const _find = Collection.prototype.find
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


exports.Model = Resource
exports.Nested = NestedResource
exports.GroupedResource = GroupedResource
exports.Factory = ResourceFactory

exports.Template = ResourceTemplate
exports.Collection = Collection
exports.GroupedResourceCollection = GroupedResourceCollection
