import * as ModelConstants from 'constants/models'
import { Workflow } from 'models/workflow'
import { Group as TaskGroup, Collection as TasksCollection } from 'models/task'
import uuidv4 from 'uuid/v4'

export default TasksCollection.extend({
  initialize () {
    TasksCollection.prototype.initialize.apply(this, arguments)

    this.on('change', (model) => {
      let changedAttributes = model.changedAttributes()
      if (changedAttributes.hasOwnProperty('last_execution')) {
        this.sort()
      }
    })
  },
  comparator (m1, m2) {
    if (isDate(m1.last_execution) && isDate(m2.last_execution)) {
      if (m1.last_execution > m2.last_execution) { return -1 }
      else if (m1.last_execution < m2.last_execution) { return 1 }
    }
    else if (isDate(m1.last_execution)) { return -1 }
    else if (isDate(m2.last_execution)) { return 1 }
    else {
      let m1IsWf = isWorkflow(m1)
      let m2IsWf = isWorkflow(m2)

      if ((m1IsWf && m2IsWf) || (!m1IsWf && !m2IsWf)) {
        if (m1.name?.toLowerCase()<m2.name?.toLowerCase()) { return -1 }
        if (m1.name?.toLowerCase()>m2.name?.toLowerCase()) { return  1 }
        return 0
      }
      else if (m1IsWf) { return -1 }
      else if (m2IsWf) { return 1 }
    }
  },
  model (attrs, options={}) {
    const taskModel = TasksCollection.prototype.model

    if (attrs._type == ModelConstants.TYPE_WORKFLOW) {
      return new Workflow(attrs, options)
    } else {
      return taskModel.apply(this, arguments)
    }
  },
  isModel (model) {
    const isTaskModel = TasksCollection.prototype.isModel
    return model instanceof Workflow || isTaskModel.apply(this, arguments)
  },
  regroup (models, groupBy) {
    this.set([]) // empty
    this.reset( groupModelsBy(models, groupBy) )
    return this
  }
})

const isDate = function (date) {
  if (!date) {
    return false
  } else {
    return (date instanceof Date)
  }
}

const isWorkflow = (model) => {
  return /Workflow/.test(model._type)
}

const groupModelsBy = (models, groupBy) => {
  const { tag, prop } = groupBy

  if (Object.keys(groupBy).length === 0) {
    return models
  }

  if (!prop) {
    return models
  }

  let groups
  if (prop === 'tags') {
    groups = groupModelsByTags(models, tag)
  } else {
    groups = groupModelsByProperty(models, prop)
  }

  return Object.keys(groups).map(key => {
    let group = groups[key]
    if (
      !group.submodels ||
      prop === 'hostname' ||
      group.submodels.models.length > 1
    ) {
      return group
    } else {
      return group.submodels.models[0]
    }
  })
}

// use tags to group all the resources with that tag
const groupModelsByTags = (models, tag) => {
  const groups = {}
  models.forEach(model => {
    const tags = model.get('tags')
    if (!Array.isArray(tags)||tags.length===0) {
      addModelToGroup(model, groups, 'tags', null)
    } else {
      const tag = tags[0].toLowerCase()
      addModelToGroup(model, groups, 'tags', tag)
    }
  })
  return groups
}

const groupModelsByProperty = (models, prop) => {
  if (!prop || typeof prop != 'string') {
    return models
  }

  // build groups by distinct property values
  const groups = {}
  models.forEach(model => {
    let value = model[prop]
    if (typeof value !== 'string'||!value) {
      value = null
    }
    addModelToGroup(model, groups, prop, value)
  })
  return groups
}

const addModelToGroup = (model, groups, prop, value) => {
  //value || (value = 'others')
  if (!value) { // no valid value for prop
    groups[model.id] = model
  } else {
    if (!groups[value]) { // create's the group
      groups[value] = new TaskGroup({
        tags: ['group'],
        groupby: prop,
        id: uuidv4(),
        name: jsUcfirst(`${value}`),
        description: `group by ${prop} property with value ${value}`
      })
    }
    groups[value].submodels.add(model)
  }
}

const jsUcfirst = (text) => {
  if (typeof text !== 'string') {
    return ''
  }

  return (
    text
      .split(' ')
      .map(text => {
        return text.charAt(0).toUpperCase() + text.slice(1)
      })
      .join(' ')
  )
}
