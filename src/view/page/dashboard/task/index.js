import { TYPE_WORKFLOW, TYPE_GROUP } from 'constants/models'
import WorkflowRowView from './workflow'
import TaskRowView from './task'
import GroupRowView from './group'

export default function (specs) {
  const type = specs.model._type || specs.model.type

  if (type == TYPE_WORKFLOW) {
    return new WorkflowRowView(specs)
  } else if (type == TYPE_GROUP || /group/i.test(type)) { // @TODO: review. FIX
    return new GroupRowView(specs)
  } else {
    return new TaskRowView(specs)
  }
}
