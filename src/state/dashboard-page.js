'use strict'

import App from 'ampersand-app'
import uuidv4 from 'uuid/v4'

import { Model as Resource } from 'models/resource'
import { Collection as ResourceCollection } from 'models/resource'
import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'

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
  comparator: 'name',
  // is not being used. this collection works like a subset of the resources collection
  //model (attrs, options) {
  //},
  isModel (model) {
    return model instanceof Resource || model instanceof GroupedResource
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

module.exports = AmpersandState.extend({
  props: {
    resourcesDataSynced: ['boolean',false,false],
    tasksDataSynced: ['boolean',false,false],
    monitorsGroupBy: ['object',false, () => { return { prop: 'name' } }]
  },
  collections: {
    // representation of the current groups being display
    groupedResources: GroupedResourceCollection
  },
  groupResources () {
    const resources = App.state.resources.models
    // now always group dstat and psaux into host
    const groups = applyMonitorsGroupBy(groupByHost(resources), this.monitorsGroupBy)

    this.groupedResources.reset(groups)
  },
  setMonitorsGroupBy (groupBy) {
    this.monitorsGroupBy = parseMonitorsGroupBy(groupBy)
  }
})

const ucfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const monitorPropertyValueDescriptionMap = (value) => {
  const descriptions = {
    'scraper': 'Web Checks',
    'script': 'Scripts',
    'file': 'Files',
    'process': 'Processes',
    'host': 'Hosts',
    'dstat': 'Hosts Stats',
    'psaux': 'Hosts Processes',
  }

  return ( descriptions[value] || ucfirst(value) )
}

/**
 * @param {Object} query uri query string
 * @return {String[]}
 */
const parseMonitorsGroupBy = (groupby) => {
  if (!groupby) return {}
  if (Array.isArray(groupby)) return {}
  if (typeof groupby != 'object') return {}

  if (typeof groupby.prop != 'string') groupby.prop = ''

  if (!Array.isArray(groupby.tags)) {
    if (typeof groupby.tags == 'string') {
      groupby.tags = [groupby.tags.toLowerCase()]
    }
  } else {
    groupby.tags = groupby
      .tags
      .filter(tag => typeof tag == 'string')
      .map(tag => tag.toLowerCase())
  }

  return groupby
}

/**
 *
 * @summary given a set of resources attach them to the hosts and turn resources into grouped resource.
 * bind the grouped host resource to the original host model
 *
 * @param {Resource[]} resources
 * @return {GroupedResource[]}
 *
 */
const groupByHost = (resources) => {
  const groupedMonitors = []
  const hostmonitors = {}

  if (!Array.isArray(resources) || resources.length === 0) {
    return resources
  }

  resources.forEach(resource => {
    let type = resource.type
    if (type == 'dstat' || type == 'psaux' || type == 'host') {
      let hostname = resource.hostname
      hostmonitors[hostname] || (hostmonitors[hostname] = { resources: [] })

      if (type == 'host') {
        let grouped = new GroupedResource()
        grouped.set( resource.serialize() )
        //grouped.type = `groupby-hostname-${hostname}`,
        //grouped.submonitors.add(resource) // add itself to the subgroup
        groupedMonitors.push(grouped)
        // add to hostmonitors
        hostmonitors[hostname].host = grouped
        resource.on('change',() => {
          grouped.set( resource.changedAttributes() )
        })
      }

      hostmonitors[hostname].resources.push(resource)

    } else {
      groupedMonitors.push(resource)
    }
  })

  for (let hostname in hostmonitors) {
    let monitors = hostmonitors[hostname]
    let host = monitors.host
    if (host !== undefined) {
      host.submonitors.add(monitors.resources)
    }
    // else data error ??
  }

  return groupedMonitors
}

/**
 * @param {GroupedResourceCollection} resources
 * @param {Object} groupBy
 * @property {String[]} groupBy.tags
 * @property {String} groupBy.prop
 *
 * @return {GroupedResource[]}
 */
const applyMonitorsGroupBy = (resources, groupBy) => {
  const { tags, prop } = groupBy

  if (Object.keys(groupBy).length === 0) return null

  if (prop) {
    return groupByProperty(resources, prop)
  } else if (tags) {
    return groupByTags(resources, tags)
  } else {
    return resources
  }
}

/**
 * @summary Group resources using a single property of each model
 *
 * @param {GroupedResourceCollection} resources
 * @param {String} prop
 *
 * @return {GroupedResource[]}
 */
const groupByProperty = (resources, prop) => {
  if (!prop||typeof prop != 'string') {
    return resources
  }

  // build groups by distinct property values
  const groups = {}

  const addToGroup = (resource,name) => {
    name || (name = 'Others')

    const keys = ['group',prop,name]

    if (!groups[name]) {
      groups[name] = new GroupedResource({
        id: `group_${uuidv4()}`,
        type: `groupby-${prop}-${name}`,
        tags: keys,
        name: monitorPropertyValueDescriptionMap( name.toLowerCase() ),
        description: `Grouped monitors by ${prop} property with value ${name}`
      })
    }

    groups[name].submonitors.add(resource)
  }

  resources.forEach(resource => {
    let name = resource[prop]
    addToGroup(resource,name)
  })

  return Object.keys(groups).map(key => groups[key])
}

/**
 * @summary Group resources using the tags of each model
 * @param {GroupedResourceCollection} resources
 * @param {String[]} tags
 *
 * @return {GroupedResource[]}
 */
const groupByTags = (resources, tags) => {
  if (!Array.isArray(tags)||tags.length===0) {
    return resources
  }

  // create an item in the resources for each tag
  const tagGroups = []
  tags.forEach(tag => {
    const lctag = tag.toLowerCase
    tagGroups.push(
      new GroupedResource({
        id: 'group_tags_' + lctag,
        type: 'groupby_tag_' + lctag,
        tags: ['group', 'tags', lctag],
        name: lctag,
        description: lctag
      })
    )
  })

  resources.forEach(resource => {
    /** @todo merge the tags of all the grouped items **/
    const ctags = resource.get('formatted_tags')

    if (!Array.isArray(ctags)||ctags.length===0) {
      return
    }

    ctags.forEach(function(tag){
      if (!tag) return // empty tag?

      let lctag = tag.toLowerCase();

      // search for groups with the same tags
      if (tags.indexOf(lctag) !== -1) {
        let group = tagGroups.find((g) => {
          return g.name == lctag
        })
        group.submonitors.add(resource)
      } else {
        // do not group nor show. ignore
      }
    })
  })

  return tagGroups
}
