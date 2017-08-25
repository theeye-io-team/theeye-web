import AppModel from 'lib/app-model'
import AppCollection from 'lib/app-collection'

import Collect from 'ampersand-collection'

import Schema from 'models/resource/schema'
import { Model as Template } from 'models/resource/template'
import { Model as Host } from 'models/host'
import { Model as Monitor } from 'models/monitor'
import moment from 'moment'
import merge from 'lodash/merge'

const urlRoot = '/api/resource'

export const Model = Schema.extend({
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
        const state = this.get('state')
        const severity = this.get('failure_severity')

        if (!state || !severity) return

        if (state==='failure') {
          if (!severity) return 'failure';
          else return severity.toLowerCase();
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
    }
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
  //stateOrder: function(){
  //  return stateIcons.indexOf(this.stateSeverity);
  //},
  hasError: function(){
    return this.isFailing()||this.isNotReporting();
  },
  isFailing: function(){
    return this.get('state')==='failure';
  },
  isNotReporting: function(){
    return this.get('state')==='updates_stopped';
  },
  submonitorsWithError: function(){
    var submons = this.get('submonitors');
    if (!submons) return null;
    return submons.filter(function(monitor){
      return monitor.hasError();
    }).length > 0;
  }
})

export const Collection = AppCollection.extend({
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
  }
})

const stateIcons = {
  unknown         : 'icon-nonsense',
  normal          : 'icon-check',
  low             : 'icon-info', /* failure state */
  high            : 'icon-warn', /* failure state */
  critical        : 'icon-fatal', /* failure state */
  failure         : 'icon-fatal', /* failure state */
  updates_stopped : 'icon-error',
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
    ].indexOf(value);
  },
  classToState (iconClass) {
    var self = this;
    var elems = Object.keys(self).filter(function(state){
      if (self[state]==iconClass) return state;
    });
    return elems[0];
  },
  filterAlertIconClasses (iconClasses) {
    var failureClasses = ['icon-info','icon-warn','icon-fatal'],
      filtered = iconClasses.filter(function(idx,icon){
        return failureClasses.indexOf(icon) != -1
      });
    return filtered;
  }
}
