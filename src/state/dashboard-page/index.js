'use strict'

import { Model as Resource } from 'models/resource'
import { Collection as ResourceCollection } from 'models/resource'
import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'

const typesToGroupIntoHostname = ['host','dstat','psaux'] // always group into hostname

/**
 * Resource but with a subresources/submonitors collection
 */
const GroupedResource = Resource.extend({
  hasError () {
    return false;
  },
  submonitorsWithError () {
    return this.submonitors.filter((monitor) => {
      return monitor.hasError()
    }).length > 0
  },
  collections: {
    submonitors: ResourceCollection
  }
})

const GroupedResourceCollection = ResourceCollection.extend({
  comparator: 'name',
  model: GroupedResource
})

export default AmpersandState.extend({
  props: {
    resourcesDataSynced: ['boolean',false,false],
    tasksDataSynced: ['boolean',false,false],
    monitorsGroupBy: ['object',false, () => { return { prop: 'type' } }]
  },
  collections: {
    // representation of the current groups being display
    groupedResources: GroupedResourceCollection
  },
  groupResources () {
    const resources = App.state.resources.models

    var groups = applyMonitorsGroupBy(resources, this.monitorsGroupBy)
    if (!groups) {
      groups = groupByHost(resources)
    }

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
    'scraper': 'Web Check Monitors',
    'script': 'Script Monitors',
    'file': 'File Monitors',
    'process': 'Process Monitors',
    'host': 'Host Monitors',
    'dstat': 'Host Stats Monitors',
    'psaux': 'Host Processes Monitors',
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
 * @summary  given a set of resources attach them to the hosts and turn resources into grouped resource
 *
 * @param {Resource[]} resources
 * @return {GroupedResource[]}
 *
 */
const groupByHost = (resources) => {
  const groupedMonitors = []
  const hostGroups = {}

  if (!Array.isArray(resources) || resources.length === 0) {
    return
  }

  resources.forEach((resource) => {
    if (typesToGroupIntoHostname.indexOf(resource.get('type')) !== -1) {
      if (!hostGroups[resource.get('hostname')]) {
        hostGroups[resource.get('hostname')] = [];
      }
      hostGroups[resource.get('hostname')].push(resource);
    } else {
      let grouped = new GroupedResource()
      grouped.set(resource._values)
      grouped.submonitors.add(resource) // add itself to the subgroup

      groupedMonitors.push(grouped)
    }
  })

  for (let hostname in hostGroups) {
    let group = hostGroups[hostname]
    let host = group.find(function(m){ return m.get('type') === 'host' });

    if (host!==undefined) {
      let groupedHost = new GroupedResource()
      groupedHost.set(host._values)
      // add dstat and psaux resources
      groupedHost.submonitors.add(
        group.filter((m) => {
          let type = m.get('type')
          return type === 'host' || type === 'dstat' || type === 'psaux'
        })
      )
      groupedMonitors.push(groupedHost)
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
    return null
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
        id: keys.join('-'),
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
    //if (prop == 'type') {
    //  // group into hostname group
    //  if (typesToGroupIntoHostname.indexOf(name) !== -1) {
    //    addToGroup(resource,resource.hostname)
    //  } else {
          addToGroup(resource,name)
    //  }
  })

  return Object.values(groups)
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
