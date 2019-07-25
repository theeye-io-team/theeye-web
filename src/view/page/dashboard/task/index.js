import { TYPE_WORKFLOW, TYPE_GROUP } from 'constants/models'
import WorkflowRowView from './workflow'
import TaskRowView from './task'
import GroupRowView from './group'

module.exports = (specs) => {
  const type = specs.model._type

  if (type == TYPE_WORKFLOW) {
    return new WorkflowRowView(specs)
  } else if (type == TYPE_GROUP) {
    return new GroupRowView(specs)
  } else {
    return new TaskRowView(specs)
  }
}
