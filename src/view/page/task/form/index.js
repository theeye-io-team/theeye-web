import ScriptForm from './script'
import ScraperForm from './scraper'
import ApprovalForm from './approval'
import DummyForm from './dummy'
import TaskConstants from 'constants/task'

module.exports = function (options) {
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

  throw new Error(`unrecognized task type ${task.type}`)
}
