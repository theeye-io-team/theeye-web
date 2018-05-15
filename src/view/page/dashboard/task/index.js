import { TYPE_WORKFLOW } from 'constants/models'
import WorkflowRowView from './workflow'
import TaskRowView from './task'

module.exports = (specs) => {
  const type = specs.model._type

  if (type == TYPE_WORKFLOW) {
    return new WorkflowRowView(specs)
  } else {
    return new TaskRowView(specs)
  }
}
