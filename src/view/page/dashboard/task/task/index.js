import TaskConstants from 'constants/task'
import CollapsibleRow from './collapse'

module.exports = function (options) {
  switch (options.model.type) {
    case TaskConstants.TYPE_SCRIPT:
      return new CollapsibleRow.Script(options)
      break;
    case TaskConstants.TYPE_SCRAPER:
      return new CollapsibleRow.Scraper(options)
      break;
    case TaskConstants.TYPE_APPROVAL:
      return new CollapsibleRow.Approval(options)
      break;
    case TaskConstants.TYPE_DUMMY:
      return new CollapsibleRow.Dummy(options)
      break;
    case TaskConstants.TYPE_NOTIFICATION:
      return new CollapsibleRow.Notification(options)
      break;
    default:
      throw new Error(`Task Type ${options.model.type} hasn't got a view`)
      break;
  }
}
