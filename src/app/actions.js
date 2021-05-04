import App from 'ampersand-app'

import AuthActions from 'actions/auth'
import CustomerActions from 'actions/customer'
import DashboardActions from 'actions/dashboard'
import FileActions from 'actions/file'
import ScriptActions from 'actions/script'
import HostActions from 'actions/host'
import IndicatorActions from 'actions/indicator'
import JobActions from 'actions/job'
import MemberActions from 'actions/member'
import MonitorActions from 'actions/monitor'
import NavbarActions from 'actions/navbar'
import NotificationActions from 'actions/notifications'
import OnHoldActions from 'actions/onHold'
import PopupActions from 'actions/popup'
import ResourceActions from 'actions/resource'
import SchedulerActions from 'actions/schedule'
import SearchBoxActions from 'actions/searchbox'
import SessionActions from 'actions/session'
import SettingsMenuActions from 'actions/settings-menu'
import TabsActions from 'actions/tabs'
import TaskActions from 'actions/task'
import TokenActions from 'actions/token'
import WorkflowActions from 'actions/workflow'
import UserActions from 'actions/user'
import OnboardingActions from 'actions/onboarding'
import LocalSettingsActions from 'actions/local-settings'

export default {
  actions: {
    auth: AuthActions,
    customer: CustomerActions,
    dashboard: DashboardActions,
    file: FileActions,
    host: HostActions,
    indicator: IndicatorActions,
    job: JobActions,
    member: MemberActions,
    monitor: MonitorActions,
    navbar: NavbarActions,
    notification: NotificationActions,
    onHold: OnHoldActions,
    popup: PopupActions,
    resource: ResourceActions,
    scheduler: SchedulerActions,
    script: ScriptActions,
    searchbox: SearchBoxActions,
    session: SessionActions,
    settingsMenu: SettingsMenuActions,
    tabs: TabsActions,
    task: TaskActions,
    token: TokenActions,
    workflow: WorkflowActions,
    user: UserActions,
    onboarding: OnboardingActions,
    localSettings: LocalSettingsActions
  }
}
