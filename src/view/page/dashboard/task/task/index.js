import * as TaskConstants from 'constants/task'
import * as CollapsibleRow from './collapse'

export default function (options) {
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
    case TaskConstants.TYPE_NOTIFICATION:
      return new CollapsibleRow.Notification(options)
      break;
    case TaskConstants.TYPE_DUMMY:
    default:
      return new CollapsibleRow.Dummy(options)
      break;
  }
}
