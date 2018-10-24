import App from 'ampersand-app'

import JobActions from 'actions/job'
import FileActions from 'actions/file'
import TaskActions from 'actions/task'
import ApprovalActions from 'actions/approval'
import IndicatorActions from 'actions/indicator'
import { cancelSchedule, getSchedules, createSchedule } from 'actions/schedule'

module.exports = () => {
  App.extend({
    actions: {
      job: JobActions,
      file: FileActions,
      task: TaskActions,
      scheduler: { // remap redundant
        cancel: cancelSchedule,
        fetch: getSchedules,
        create: createSchedule
      },
      approval: ApprovalActions,
      indicator: IndicatorActions
    }
  })
}
