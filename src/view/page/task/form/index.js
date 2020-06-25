import ScriptForm from './script'
import ScraperForm from './scraper'
import ApprovalForm from './approval'
import DummyForm from './dummy'
import NotificationForm from './notification'
import * as TaskConstants from 'constants/task'

export default function (options) {
  const task = options.model
  if (task.type === TaskConstants.TYPE_SCRIPT) {
    return new ScriptForm (options)
  }

  if (task.type === TaskConstants.TYPE_SCRAPER) {
    return new ScraperForm (options)
  }

  if (task.type === TaskConstants.TYPE_APPROVAL) {
    return new ApprovalForm (options)
  }

  if (task.type === TaskConstants.TYPE_DUMMY) {
    return new DummyForm (options)
  }

  if (task.type === TaskConstants.TYPE_NOTIFICATION) {
    return new NotificationForm (options)
  }

  throw new Error(`unrecognized task type ${task.type}`)
}
