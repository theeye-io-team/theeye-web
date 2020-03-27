import App from 'ampersand-app'

import DashboardActions from 'actions/dashboard'
import JobActions from 'actions/job'
import FileActions from 'actions/file'
import TaskActions from 'actions/task'
import OnHoldActions from 'actions/onHold'
import IndicatorActions from 'actions/indicator'
import WorkflowActions from 'actions/workflow'
import PopupActions from 'actions/popup'
import SchedulerActions from 'actions/schedule'
import TabsActions from 'actions/tabs'
import ChatActions from 'actions/chat'

module.exports = () => {
  App.extend({
    actions: {
      popup: PopupActions,
      onHold: OnHoldActions,
      dashboard: DashboardActions,
      file: FileActions,
      indicator: IndicatorActions,
      job: JobActions,
      scheduler: SchedulerActions,
      task: TaskActions,
      workflow: WorkflowActions,
      tabs: TabsActions,
      chat: ChatActions
    }
  })
}
