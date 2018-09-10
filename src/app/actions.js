import App from 'ampersand-app'

import JobActions from 'actions/job'
import FileActions from 'actions/file'
import TaskActions from 'actions/task'
import ApprovalActions from 'actions/approval'

module.exports = () => {
  App.extend({
    actions: {
      job: JobActions,
      file: FileActions,
      task: TaskActions,
      approval: ApprovalActions
    }
  })
}
