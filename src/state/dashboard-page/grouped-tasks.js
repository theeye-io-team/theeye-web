import ModelConstants from 'constants/models'
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
        if (m1.name.toLowerCase()<m2.name.toLowerCase()) { return -1 }
        if (m1.name.toLowerCase()>m2.name.toLowerCase()) { return  1 }
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

    const groups = groupModelsBy(models, groupBy)
    this.reset(groups)

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
  const { tags, prop } = groupBy

  if (Object.keys(groupBy).length === 0) {
    return null
  }

  if (prop) {
    return groupByProperty(models, prop)
  } else if (tags) {
    return groupByTags(models, tags)
  } else {
    return models
  }
}

const groupByProperty = (models, prop) => {
  if (!prop || typeof prop != 'string') {
    return models
  }

  let groups = createGroupsByProp(models, prop)

  return Object.keys(groups).map(key => {
    let group = groups[key]

    if (group.submodels.models.length > 1) {
      return group
    } else {
      return group.submodels.models[0]
    }
  })
}

const createGroupsByProp = (models, prop) => {
  // build groups by distinct property values
  const groups = {}

  const addToGroup = (model, name) => {
    name || (name = 'others')
    if (!groups[name]) {
      groups[name] = new TaskGroup({
        groupby: prop,
        id: uuidv4(),
        name: jsUcfirst(name),
        description: `group by ${prop} property with value ${name}`
      })
    }
    groups[name].submodels.add(model)
  }

  models.forEach(model => {
    let name = model[prop]
    addToGroup(model, name)
  })

  return groups
}

// if model is in multiple groups, add to first one
const groupByTags = (models, tags) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return models
  }

  // create an item in the group for each selected tag
  const groups = []
  tags.forEach(tag => {
    const lctag = tag.toLowerCase
    groups.push(
      new TaskGroup({
        groupby: lctag,
        id: uuidv4(),
        name: lctag,
        description: lctag
      })
    )
  })

  models.forEach(model => {
    /** @todo merge the tags of all the grouped items **/
    const ctags = model.get('formatted_tags')

    if (!Array.isArray(ctags)||ctags.length===0) {
      return
    }

    ctags.forEach(function(tag){
      if (!tag) return // empty tag?

      let lctag = tag.toLowerCase();

      // search for groups with the same tags
      if (tags.indexOf(lctag) !== -1) {
        let group = groups.find((g) => {
          return g.name == lctag
        })
        group.submodels.add(model)
      } else {
        // do not group nor show. ignore
      }
    })
  })

  return groups
}

const jsUcfirst = (text) => {
  return (
    text
      .split(' ')
      .map(text => {
        return text.charAt(0).toUpperCase() + text.slice(1)
      })
      .join(' ')
  )
}
