import App from 'ampersand-app'

import DashboardActions from 'actions/dashboard'
import JobActions from 'actions/job'
import FileActions from 'actions/file'
import TaskActions from 'actions/task'
import ApprovalActions from 'actions/approval'
import IndicatorActions from 'actions/indicator'
import { cancelSchedule, getSchedules, createSchedule } from 'actions/schedule'

module.exports = () => {
  App.extend({
    actions: {
      approval: ApprovalActions,
      dashboard: DashboardActions,
      file: FileActions,
      indicator: IndicatorActions,
      job: JobActions,
      scheduler: { // remap redundant
        cancel: cancelSchedule,
        create: createSchedule,
        fetch: getSchedules
      },
      task: TaskActions
    }
  })
}
