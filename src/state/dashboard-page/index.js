'use strict'

import { Model as Resource } from 'models/resource'
import { Collection as ResourceCollection } from 'models/resource'
import AmpersandState from 'ampersand-state'
import AmpersandCollection from 'ampersand-collection'

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
  model: GroupedResource
})


// representation of the current host group being display
export default AmpersandState.extend({
  props: {
    resourcesDataSynced: ['boolean',false,false],
    tasksDataSynced: ['boolean',false,false],
  },
  collections: {
    groupedResources: GroupedResourceCollection
  },
  /**
   * @summary 
   * @param {String[]} tagsToGroup
   */
  groupResourcesByTags (tagsToGroup) {
    const resources = App.state.resources.models
    const groups = groupByTags( groupByHost(resources), tagsToGroup )
    this.groupedResources.reset( groups )
  }
})

/**
 *
 * @summary  given a set of resources attach them to the hosts and turn resources into grouped resource
 *
 * @param {Resource[]} resources
 * @return {GroupedResource[]}
 *
 */
const groupByHost = (resources) => {
  const typesToGroup = ['host','dstat','psaux'] // always group into host
  const groupedMonitors = []
  const hostGroups = {}

  if (!Array.isArray(resources) || resources.length === 0) {
    return
  }

  resources.forEach((resource) => {
    if (typesToGroup.indexOf(resource.get('type')) !== -1) {
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
          return type === 'host' || type === 'dstat'
        })
      )
      groupedMonitors.push(groupedHost)
    }
    // else data error ??
  }

  return groupedMonitors
}

/**
 * @param {GroupedResourceCollection} groupedResources
 * @param {String[]} tagsToGroup lower case tags set . @todo are lower case ?
 * @return {GroupedResource[]}
 */
const groupByTags = (groupedResources, tagsToGroup) => {
  if (!Array.isArray(tagsToGroup)||tagsToGroup.length===0) {
    return groupedResources
  }

  // create an item in the groupedResources for each tag
  const tagGroups = []
  tagsToGroup.forEach((t) => {
    tagGroups.push(
      new GroupedResource({
        tags: [t,'group'],
        type: 'group',
        name: t.toLowerCase(),
        description: t
      })
    )
  })

  groupedResources.forEach((resource) => {
    /** @todo merge the tags of all the grouped items **/
    const ctags = resource.get('formatted_tags')

    if (!Array.isArray(ctags)||ctags.length===0) {
      return
    }

    ctags.forEach(function(tag){
      if (!tag) return // empty tag?

      let lctag = tag.toLowerCase();

      // search for groups with the same tags
      if (tagsToGroup.indexOf(lctag) !== -1) {
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
