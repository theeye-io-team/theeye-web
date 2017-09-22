'use strict'

import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'
import Collect from 'ampersand-collection'
import moment from 'moment'
import merge from 'lodash/merge'

const Schema = require('models/resource/schema')
const Template = require('models/resource/template').Model
const Host = require('models/host/index').Model
const Monitor = require('models/monitor/index').Model

const config = require('config')
const urlRoot = `${config.api_url}/resource`
const stateIcons = {
  unknown: 'icon-nonsense',
  normal: 'icon-check',
  low: 'icon-info', /* failure state */
  high: 'icon-warn', /* failure state */
  critical: 'icon-fatal', /* failure state */
  failure: 'icon-fatal', /* failure state */
  updates_stopped: 'icon-error',
  getIcon (state) {
    var icon = (this[state.toLowerCase()]||this.unknown);
    return icon;
  },
  indexOf (value) {
    // keep the indexes in order !
    return [
      'unknown',
      'normal',
      'low',
      'high',
      'critical',
      'failure', // when failure_severity is not set use failure
      'updates_stopped'
    ].indexOf(value)
  },
  classToState (iconClass) {
    var self = this;
    var elems = Object.keys(self).filter(function(state){
      if (self[state]==iconClass) return state
    })
    return elems[0]
  },
  filterAlertIconClasses (iconClasses) {
    var failureClasses = ['icon-info','icon-warn','icon-fatal'],
      filtered = iconClasses.filter(function(idx,icon){
        return failureClasses.indexOf(icon) != -1
      });
    return filtered;
  }
}

const stateMessages = {
  normal: 'Working fine',
  failure: 'Malfunction detected',
  updates_stopped: 'Stopped reporting',
}

const Model = Schema.extend({
  urlRoot: urlRoot,
  props: {
    template_id: 'string',
    host_id: 'string',
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
  children: {
    monitor: Monitor, // has one
    template: Template, // belongs to
    host: Host, // belongsto
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
        return stateIcons.indexOf( this.stateSeverity )
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

    return merge(attrs, {
      // monitor
      looptime: monitor.looptime,
      tags: monitor.tags
    })
  },
})

const Collection = AppCollection.extend({
  comparator: 'name',
  model: Model,
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
  comparator (model) {
    return model.stateOrder
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

exports.Model = Model
exports.Collection = Collection
