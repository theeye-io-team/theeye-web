'use strict'

import App from 'ampersand-app'
import uuidv4 from 'uuid/v4'

import GroupedTasksCollection from './grouped-tasks'
import { GroupedResourceCollection, GroupedResource } from 'models/resource'
import AmpersandState from 'ampersand-state'

module.exports = AmpersandState.extend({
  initialize () {
    AmpersandState.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(this.groupedTasks, 'change:inProgressJobs', () => {
      this.groupedTasks.sort()
    })
  },
  props: {
    indicatorsDataSynced: ['boolean',false,false],
    resourcesDataSynced: ['boolean',false,false],
    tasksDataSynced: ['boolean',false,false],
    monitorsGroupBy: ['object',false, () => {
      return { prop: 'name' }
    }],
    tasksGroupBy: ['object',false, () => {
      return { prop: 'name' }
    }]
  },
  collections: {
    // representation of the current groups being display
    groupedResources: GroupedResourceCollection,
    groupedTasks: GroupedTasksCollection
  },
  groupResources () {
    const resources = App.state.resources.models
    // now always group dstat and psaux into host
    const groups = groupModelsBy(
      groupMonitorsByHost(resources),
      this.monitorsGroupBy
    )
    this.groupedResources.reset(groups)
  },
  groupTasks () {
    const group = () => {
      let models = App.state.tasks.models.filter(m => !m.workflow_id)

      //App.state.workflows.models.forEach(model => models.push(model))
      this.groupedTasks.regroup(models, this.tasksGroupBy)

      this.groupedTasks.add(App.state.workflows.models)
    }

    this.listenToAndRun(App.state.tasks, 'add remove reset change:workflow_id', group)
    this.listenTo(App.state.workflows, 'add', group)
  },
  setMonitorsGroupBy (groupBy) {
    if (groupBy) {
      App.state.localSettings.monitorsGroupBy = groupBy
    }
    this.monitorsGroupBy = parseGroupBy(App.state.localSettings.monitorsGroupBy)
  },
  setTasksGroupBy (groupBy) {
    if (groupBy) {
      App.state.localSettings.tasksGroupBy = groupBy
    }
    this.tasksGroupBy = parseGroupBy(App.state.localSettings.tasksGroupBy)
  }
})

const ucfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const descriptions = {
  'scraper': 'Web Request',
  'script': 'Scripts',
  'file': 'Files',
  'process': 'Processes',
  'host': 'Bots',
  'dstat': 'Bots Stats',
  'psaux': 'Bots Processes',
}

const monitorPropertyValueDescriptionMap = (value) => {
  return ( descriptions[value] || ucfirst(value) )
}

/**
 * @param {Object} query uri query string
 * @return {String[]}
 */
const parseGroupBy = (groupby) => {
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
const groupMonitorsByHost = (resources) => {
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
        grouped.listenTo(resource, 'change', () => {
          grouped.set(resource.changedAttributes())
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
const groupModelsBy = (resources, groupBy) => {
  const { tags, prop } = groupBy

  if (Object.keys(groupBy).length === 0) return null

  if (prop) {
    if (prop === 'name') {
      return groupByName(resources)
    } else {
      return groupByProperty(resources, prop)
    }
  } else if (tags) {
    return groupByTags(resources, tags)
  } else {
    return resources
  }
}

const createGroups = (resources, prop) => {
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

  return groups
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

  const groups = createGroups(resources, prop)

  return Object.keys(groups).map(key => groups[key])
}

/**
 * @summary Group resources using name property
 *
 * @param {GroupedResourceCollection} resources
 * @param {String} prop
 *
 * @return {GroupedResource[]}
 */
const groupByName = (resources) => {

  const groups = createGroups(resources, 'name')

  const results = Object.keys(groups).map(key => {
    if (groups[key].submonitors.length === 1) {
      return groups[key].submonitors.models[0]
    } else {
      return groups[key]
    }
  })

  return results
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
